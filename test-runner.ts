import { runStudentFlowVerificationTests } from './src/utils/testVerification';

console.log('Running StudentFlow Automated Tests...');
const { passed, results } = runStudentFlowVerificationTests();

for (const r of results) {
  console.log(r);
}

if (!passed) {
  console.error('Test suite failed!');
  process.exit(1);
} else {
  console.log('All StudentFlow financial tests passed successfully!');
  process.exit(0);
}
