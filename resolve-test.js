import { createRequire } from 'module';
const require = createRequire(import.meta.url);
try {
  console.log('Require resolve:', require.resolve('tailwindcss'));
} catch (e) {
  console.log('Require resolve failed');
}

try {
  // @ts-ignore
  console.log('Import resolve:', import.meta.resolve('tailwindcss'));
} catch (e) {
  console.log('Import resolve failed');
}
