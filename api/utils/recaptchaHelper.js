const verifyRecaptcha = async (token, secretKey) => {
    try {
        const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `secret=${secretKey}&response=${token}`,
        });

        const data = await response.json();

        if (!data.success) {
            return { success: false, error: data['error-codes'] || 'Unknown error' };
        }

        return { success: true, score: data.score };
    } catch (error) {
        console.error('reCAPTCHA verification error:', error);
        return { success: false, error: 'Verification failed' };
    }
};

module.exports = { verifyRecaptcha };