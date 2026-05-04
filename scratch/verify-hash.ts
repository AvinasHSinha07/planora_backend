import bcrypt from 'bcrypt';

async function main() {
  const hash = '$2b$10$YgPfNuJUDS.49kBdkriz8.WTCI5rg4NpH9r1/jJ1fQS0HoXiGb9o6';
  const isMatch = await bcrypt.compare('admin123', hash);
  console.log('Match:', isMatch);
}

main();
