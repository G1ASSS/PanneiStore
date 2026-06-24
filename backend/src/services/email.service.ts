export const sendPasswordResetEmail = async (email: string, resetLink: string) => {
  // In a real application, you would use a service like SendGrid, Mailgun, AWS SES, or NodeMailer here.
  // For now, we are mocking the email sending by logging it to the console.
  console.log('\n======================================================');
  console.log('✉️  MOCK EMAIL SERVICE');
  console.log('======================================================');
  console.log(`To: ${email}`);
  console.log('Subject: Reset Your Password - PanneiStore');
  console.log('\nBody:');
  console.log('We received a request to reset your password. If you didn\'t make this request, you can safely ignore this email.');
  console.log('\nClick the link below to reset your password:');
  console.log(resetLink);
  console.log('======================================================\n');
  
  // Simulate network delay
  return new Promise(resolve => setTimeout(resolve, 500));
};
