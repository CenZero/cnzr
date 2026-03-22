import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

function createSpinner(label: string) {
  if (!process.stdout.isTTY) {
    return {
      update: (text: string) => console.log(`• ${text}`),
      success: (text: string) => console.log(`✔ ${text}`),
      fail: (text: string) => console.error(`✖ ${text}`),
      stop: () => undefined,
    };
  }

  let frame = 0;
  let text = label;
  const interval = setInterval(() => {
    frame = (frame + 1) % frames.length;
    process.stdout.write(`\r${frames[frame]} ${text}`);
  }, 80);

  return {
    update: (nextText: string) => {
      text = nextText;
    },
    success: (finalText: string) => {
      clearInterval(interval);
      process.stdout.write(`\r✔ ${finalText}\n`);
    },
    fail: (finalText: string) => {
      clearInterval(interval);
      process.stdout.write(`\r✖ ${finalText}\n`);
    },
    stop: () => clearInterval(interval),
  };
}

export async function createProject(projectName: string, options: any) {
  const spinner = createSpinner(`Creating ${projectName} with Cenzero 2.0...`);
  spinner.update("Scaffolding directories");

  const projectPath = join(process.cwd(), projectName);
  const description = options?.description || "";

  try {
    // Create project directory structure
    await mkdir(projectPath, { recursive: true });
    await mkdir(join(projectPath, "src"), { recursive: true });
    await mkdir(join(projectPath, "public"), { recursive: true });
    await mkdir(join(projectPath, "views"), { recursive: true });

    spinner.update("Writing package.json");
    // Create package.json
    const packageJson = {
      name: projectName,
      version: "1.0.0",
      description,
      main: "src/index.ts",
      scripts: {
        start: "node dist/index.js",
        dev: "cnzr dev",
        build: "cnzr build",
      },
      dependencies: {
        cnzr: "^2.0.0",
      },
      devDependencies: {
        "@types/node": "^20.0.0",
        typescript: "^5.0.0",
        "ts-node": "^10.0.0",
      },
    };

    await writeFile(
      join(projectPath, "package.json"),
      JSON.stringify(packageJson, null, 2)
    );

    spinner.update("Configuring TypeScript");
    // Create TypeScript config
    const tsConfig = {
      compilerOptions: {
        target: "ES2020",
        module: "commonjs",
        outDir: "./dist",
        rootDir: "./src",
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
      },
    };

    await writeFile(
      join(projectPath, "tsconfig.json"),
      JSON.stringify(tsConfig, null, 2)
    );

    spinner.update("Generating starter app");
    // Create main application file
    const appCode = `import { CenzeroApp, CenzeroContext } from 'cnzr';

const app = new CenzeroApp();

// Configure session (optional)
app.useSession({
  secret: 'your-secret-key-here',
  name: 'session',
  maxAge: 1800, // 30 minutes
});

// Middleware example
app.use((ctx: CenzeroContext, next: () => void) => {
  console.log(\`\${ctx.req.method} \${ctx.req.path}\`);
  next();
});

// Routes
app.get('/', (ctx: CenzeroContext) => {
  ctx.res.json({ 
    message: 'Hello from Cenzero!',
    timestamp: new Date().toISOString()
  });
});

app.get('/users/:id', (ctx: CenzeroContext) => {
  ctx.res.json({ 
    userId: ctx.req.params?.id,
    session: ctx.session.id
  });
});

app.post('/users', (ctx: CenzeroContext) => {
  ctx.res.json({ 
    message: 'User created', 
    data: ctx.req.body 
  });
});

// Session example route
app.get('/login', (ctx: CenzeroContext) => {
  ctx.session.set('user', { id: 1, name: 'Demo User' });
  ctx.res.json({ message: 'Logged in successfully' });
});

app.get('/profile', (ctx: CenzeroContext) => {
  const user = ctx.session.get('user');
  if (!user) {
    return ctx.res.status(401).json({ error: 'Not authenticated' });
  }
  ctx.res.json({ user });
});

// Start server
const port = Number(process.env.PORT) || 3000;
app.listen(port, 'localhost', () => {
  console.log(\`🚀 Cenzero app is running on port \${port}!\`);
});
`;

    await writeFile(join(projectPath, "src", "index.ts"), appCode);

    spinner.update("Adding public assets");
    // Create basic HTML template
    const indexHtml = `<!DOCTYPE html>
<html>
<head>
    <title>Welcome to Cenzero</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        h1 { color: #333; }
    </style>
</head>
<body>
    <h1>Welcome to Cenzero Framework!</h1>
    <p>Your minimal but powerful Node.js web framework is ready.</p>
</body>
</html>`;

    await writeFile(join(projectPath, "public", "index.html"), indexHtml);

    spinner.success(`Project ${projectName} created successfully ✨`);
    console.log("\nNext steps:");
    console.log(`  cd ${projectName}`);
    console.log("  npm install");
    console.log("  npm run dev");
  } catch (error) {
    spinner.fail("Error creating project");
    process.exit(1);
  } finally {
    spinner.stop();
  }
}
