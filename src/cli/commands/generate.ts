import { mkdir, writeFile, access } from "fs/promises";
import { join, dirname, isAbsolute, relative } from "path";
import { constants } from "fs";

interface RouteOptions {
  method?: string;
  path?: string;
  dir?: string;
  template?: "basic" | "crud" | "api" | "fullstack";
}

const ROUTE_TEMPLATES = {
  basic: (routeName: string, method: string, routePath: string) => `import { CenzeroContext } from "cnzr";

/**
 * ${method.toUpperCase()} ${routePath}
 * Handler for ${routeName}
 */
export async function ${routeName}Handler(ctx: CenzeroContext) {
  try {
    // TODO: Implement your logic here
    ctx.json({
      message: "${routeName} route",
      path: "${routePath}",
      method: "${method.toUpperCase()}",
    });
  } catch (error: any) {
    ctx.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}
`,

  api: (routeName: string, method: string, routePath: string) => `import { CenzeroContext } from "cnzr";

/**
 * ${method.toUpperCase()} ${routePath}
 * RESTful API handler for ${routeName}
 */
export async function ${routeName}Handler(ctx: CenzeroContext) {
  try {
    // Validate request
    if (!ctx.body) {
      return ctx.status(400).json({
        error: "Bad Request",
        message: "Request body is required",
      });
    }

    // TODO: Add your business logic here
    const result = {
      success: true,
      data: ctx.body,
      timestamp: new Date().toISOString(),
    };

    ctx.json(result);
  } catch (error: any) {
    ctx.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
}
`,

  crud: (routeName: string, method: string, routePath: string) => {
    const entityName = routeName.replace(/Handler$/, "");
    const capitalizedEntity = entityName.charAt(0).toUpperCase() + entityName.slice(1);

    return `import { CenzeroContext } from "cnzr";

// TODO: Replace with your actual database/storage layer
const ${entityName}Store: any[] = [];

/**
 * CRUD operations for ${capitalizedEntity}
 */

// GET - List all ${entityName}s
export async function list${capitalizedEntity}s(ctx: CenzeroContext) {
  try {
    const page = parseInt(ctx.query.page as string) || 1;
    const limit = parseInt(ctx.query.limit as string) || 10;
    
    ctx.json({
      data: ${entityName}Store,
      pagination: {
        page,
        limit,
        total: ${entityName}Store.length,
      },
    });
  } catch (error: any) {
    ctx.status(500).json({ error: error.message });
  }
}

// GET - Get single ${entityName}
export async function get${capitalizedEntity}(ctx: CenzeroContext) {
  try {
    const id = ctx.params.id;
    const item = ${entityName}Store.find((item: any) => item.id === id);
    
    if (!item) {
      return ctx.status(404).json({ error: "${capitalizedEntity} not found" });
    }
    
    ctx.json({ data: item });
  } catch (error: any) {
    ctx.status(500).json({ error: error.message });
  }
}

// POST - Create new ${entityName}
export async function create${capitalizedEntity}(ctx: CenzeroContext) {
  try {
    const data = ctx.body;
    
    // Validation
    if (!data || Object.keys(data).length === 0) {
      return ctx.status(400).json({ error: "Request body is required" });
    }
    
    const newItem = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
    };
    
    ${entityName}Store.push(newItem);
    
    ctx.status(201).json({ data: newItem });
  } catch (error: any) {
    ctx.status(500).json({ error: error.message });
  }
}

// PUT - Update ${entityName}
export async function update${capitalizedEntity}(ctx: CenzeroContext) {
  try {
    const id = ctx.params.id;
    const data = ctx.body;
    
    const index = ${entityName}Store.findIndex((item: any) => item.id === id);
    
    if (index === -1) {
      return ctx.status(404).json({ error: "${capitalizedEntity} not found" });
    }
    
    ${entityName}Store[index] = {
      ...${entityName}Store[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    ctx.json({ data: ${entityName}Store[index] });
  } catch (error: any) {
    ctx.status(500).json({ error: error.message });
  }
}

// DELETE - Remove ${entityName}
export async function delete${capitalizedEntity}(ctx: CenzeroContext) {
  try {
    const id = ctx.params.id;
    const index = ${entityName}Store.findIndex((item: any) => item.id === id);
    
    if (index === -1) {
      return ctx.status(404).json({ error: "${capitalizedEntity} not found" });
    }
    
    const deleted = ${entityName}Store.splice(index, 1)[0];
    
    ctx.json({ message: "${capitalizedEntity} deleted", data: deleted });
  } catch (error: any) {
    ctx.status(500).json({ error: error.message });
  }
}
`;
  },

  fullstack: (routeName: string, method: string, routePath: string) => `import { CenzeroContext } from "cnzr";

/**
 * ${method.toUpperCase()} ${routePath}
 * Fullstack page handler with integrated frontend + backend data endpoint.
 */
export async function ${routeName}Page(ctx: CenzeroContext) {
  ctx.html(\`<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${routeName} - Cenzero Fullstack</title>
  <style>
    body { font-family: Inter, Arial, sans-serif; margin: 2rem; color: #1f2937; }
    .card { max-width: 720px; border: 1px solid #e5e7eb; border-radius: 10px; padding: 1rem 1.2rem; }
    pre { background: #f9fafb; border-radius: 8px; padding: .8rem; overflow-x: auto; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${routeName} fullstack route</h1>
    <p>This page fetches backend JSON from <code>${routePath}/data</code>.</p>
    <pre id="result">Loading...</pre>
  </div>
  <script>
    fetch("${routePath}/data")
      .then((r) => r.json())
      .then((data) => {
        document.getElementById("result").textContent = JSON.stringify(data, null, 2);
      })
      .catch((error) => {
        document.getElementById("result").textContent = "Error: " + error.message;
      });
  </script>
</body>
</html>\`);
}

/**
 * GET ${routePath}/data
 * Backend JSON endpoint used by the frontend page.
 */
export async function ${routeName}Data(ctx: CenzeroContext) {
  ctx.json({
    route: "${routeName}",
    path: "${routePath}",
    mode: "fullstack",
    method: "${method.toUpperCase()}",
    timestamp: new Date().toISOString(),
  });
}
`,
};

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function generateRoute(
  routeName: string,
  options: RouteOptions
) {
  const {
    method = "get",
    path = `/${routeName}`,
    dir = "src/routes",
    template = "basic",
  } = options;

  console.log(`🔧 Generating ${template} route: ${routeName}`);

  try {
    const routesDir = isAbsolute(dir) ? dir : join(process.cwd(), dir);
    const fileName = `${routeName}.ts`;
    const filePath = join(routesDir, fileName);

    // Create routes directory if it doesn't exist
    await mkdir(routesDir, { recursive: true });

    // Check if file already exists
    if (await fileExists(filePath)) {
      console.log(
        `⚠️  File ${fileName} already exists. Use --force to overwrite.`
      );
      return;
    }

    // Generate route code based on template
    let routeCode: string;

    if (template === "crud") {
      routeCode = ROUTE_TEMPLATES.crud(routeName, method, path);
    } else if (template === "fullstack") {
      routeCode = ROUTE_TEMPLATES.fullstack(routeName, method, path);
    } else if (template === "api") {
      routeCode = ROUTE_TEMPLATES.api(routeName, method, path);
    } else {
      routeCode = ROUTE_TEMPLATES.basic(routeName, method, path);
    }

    // Write file
    await writeFile(filePath, routeCode);

    console.log(`✅ Route created: ${filePath}`);
    console.log("");
    console.log("Usage example:");

    const relativeBase = isAbsolute(dir) ? relative(process.cwd(), dir) : dir;
    const importBase = relativeBase.startsWith(".")
      ? relativeBase
      : `./${relativeBase}`;

    if (template === "crud") {
      const entityName = routeName.replace(/Handler$/, "");
      const capitalizedEntity =
        entityName.charAt(0).toUpperCase() + entityName.slice(1);

      console.log(`
import { list${capitalizedEntity}s, get${capitalizedEntity}, create${capitalizedEntity}, update${capitalizedEntity}, delete${capitalizedEntity} } from '${importBase}/${routeName}';

app.get('${path}', list${capitalizedEntity}s);
app.get('${path}/:id', get${capitalizedEntity});
app.post('${path}', create${capitalizedEntity});
app.put('${path}/:id', update${capitalizedEntity});
app.delete('${path}/:id', delete${capitalizedEntity});
      `);
    } else if (template === "fullstack") {
      console.log(`
import { ${routeName}Page, ${routeName}Data } from '${importBase}/${routeName}';

app.${method}('${path}', ${routeName}Page);
app.get('${path}/data', ${routeName}Data);
      `);
    } else {
      console.log(`
import { ${routeName}Handler } from '${importBase}/${routeName}';

app.${method}('${path}', ${routeName}Handler);
      `);
    }
  } catch (error: any) {
    console.error("❌ Error generating route:", error.message);
    process.exit(1);
  }
}
