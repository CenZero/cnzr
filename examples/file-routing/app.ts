import { CenzeroApp } from '../../src';

const app = new CenzeroApp({
  useContext: true,
  useFileRouting: true,
  routesDir: './routes'
});

app.listen(3001, 'localhost', () => {
  console.log('🗂️  File-based routing demo running on http://localhost:3001');
  console.log('');
  console.log('Routes from files:');
  const routes = app.getFileRoutes();
  routes.forEach(route => {
    console.log(`  ${route.method.padEnd(6)} ${route.pattern}`);
  });
});
