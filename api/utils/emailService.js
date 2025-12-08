const nodemailer = require("nodemailer");
const config = require("../config/config");

// Tạo transporter cho email
const createTransport = () => {
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
};

const maskName = (fullName) => {
    if (!fullName) return "****User";
    const name = fullName.trim();
    const parts = name.split(" ");
    const lastName = parts[parts.length - 1];
    return `****${lastName}`;
};

const sendNewQuestionEmail = async ({
    sellerEmail,
    sellerName,
    productName,
    productId,
    askerName,
    askerEmail,
    question,
}) => {
    try {
        const transporter = createTransport();

        const maskedAskerName = maskName(askerName);
        const productUrl = `${process.env.FRONTEND_URL}/products/${productId}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: sellerEmail,
            replyTo: askerEmail || undefined,
            subject: `Câu hỏi mới về sản phẩm: ${productName}`,
            html: `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 30px 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                
                <div style="background-color: #f59e0b; height: 6px; width: 100%;"></div>
                
                <div style="padding: 40px 30px;">
                <h2 style="color: #111827; margin-top: 0; margin-bottom: 20px; font-size: 24px; font-weight: 700;">
                    Sản phẩm của bạn đang được chú ý!
                </h2>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                    Xin chào <strong>${sellerName}</strong>,<br>
                    Tài khoản <strong>${maskedAskerName}</strong> vừa để lại một câu hỏi cho sản phẩm <strong style="color: #d97706;">${productName}</strong>.
                </p>

                <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 4px; margin-bottom: 30px;">
                    <p style="margin: 0; color: #92400e; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Nội dung câu hỏi:</p>
                    <p style="margin-top: 10px; margin-bottom: 0; color: #1f2937; font-size: 16px; font-style: italic;">
                    "${question}"
                    </p>
                </div>

                <div style="text-align: center; margin-bottom: 10px;">
                    <a href="${productUrl}" 
                    style="display: inline-block; background-color: #f59e0b; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; font-size: 16px; transition: background-color 0.3s ease; box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);">
                    Phản hồi ngay
                    </a>
                </div>
                
                </div> 
                <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                    Email này được gửi tự động từ hệ thống đấu giá.<br>
                    Vui lòng không trả lời trực tiếp email này.
                </p>
                </div>
            </div>
            </div>
        `,
        };

        await transporter.sendMail(mailOptions);
        console.log(
            "Email thông báo câu hỏi mới đã được gửi đến:",
            sellerEmail
        );
    } catch (error) {
        console.error("Lỗi khi gửi email thông báo câu hỏi:", error);
    }
};

const sendOTPEmail = async ({
    email,
    full_name,
    otp,
    type = "forgot_password",
}) => {
    try {
        const transporter = createTransport();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Mã OTP khôi phục mật khẩu",
            html: `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 30px 0;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                  
                  <div style="background-color: #f59e0b; height: 6px; width: 100%;"></div>
                  
                  <div style="padding: 40px 30px 30px 30px;">
                      <h2 style="color: #111827; margin-top: 0; margin-bottom: 24px; font-size: 24px; font-weight: 700;">
                          Xác thực mã OTP
                      </h2>
                      
                      <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                          Xin chào <strong>${full_name}</strong>,<br>
                          Bạn đã yêu cầu khôi phục mật khẩu. Đây là mã xác thực của bạn:
                      </p>

                      <div style="text-align: center; margin: 30px 0;">
                          <span style="font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #111827; font-family: 'Courier New', monospace;">
                              ${otp}
                          </span>
                          <p style="color: #ef4444; font-size: 14px; margin-top: 10px; font-weight: 500;">
                              (Mã có hiệu lực trong 5 phút. Tuyệt đối không chia sẻ mã này)
                          </p>
                      </div>
                      
                      <p style="color: #6b7280; font-size: 15px; line-height: 1.5; margin-bottom: 10px;">
                          Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này.
                      </p>
                  </div>

                  <div style="background-color: #f9fafb; padding: 20px 30px 30px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="color: #9ca3af; font-size: 13px; margin: 0; line-height: 1.5;">
                          Email này được gửi tự động từ hệ thống đấu giá.<br>
                          Vui lòng không trả lời trực tiếp email này.
                      </p>
                  </div>
                  
              </div>
          </div>
      `,
        };

        await transporter.sendMail(mailOptions);
        console.log("Email OTP đã được gửi đến:", email);
    } catch (error) {
        console.error("Lỗi khi gửi email OTP:", error);
        throw error;
    }
};

const sendAnswerEmail = async ({
    askerEmail,
    askerName,
    productName,
    productId,
    sellerName,
    sellerEmail,
    question,
    answer,
}) => {
    try {
        const transporter = createTransport();

        const maskedSellerName = maskName(sellerName);
        const productUrl = `${process.env.FRONTEND_URL}/products/${productId}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: askerEmail,
            replyTo: sellerEmail || undefined,
            subject: `Phản hồi cho câu hỏi của bạn: ${productName}`,
            html: `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 30px 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                
                <div style="background-color: #f59e0b; height: 6px; width: 100%;"></div>
                
                <div style="padding: 40px 30px;">
                <h2 style="color: #111827; margin-top: 0; margin-bottom: 20px; font-size: 24px; font-weight: 700;">
                    Phản hồi cho câu hỏi của bạn!
                </h2>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                    Xin chào <strong>${askerName}</strong>,<br>
                    Người bán <strong>${maskedSellerName}</strong> vừa phản hồi câu hỏi của bạn về sản phẩm <strong style="color: #d97706;">${productName}</strong>.
                </p>

                <div style="background-color: #f3f4f6; border-left: 4px solid #9ca3af; padding: 15px 20px; border-radius: 4px; margin-bottom: 20px;">
                    <p style="margin: 0; color: #6b7280; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Câu hỏi của bạn:</p>
                    <p style="margin-top: 8px; margin-bottom: 0; color: #374151; font-size: 15px; font-style: italic;">
                    "${question}"
                    </p>
                </div>

                <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px 20px; border-radius: 4px; margin-bottom: 30px;">
                    <p style="margin: 0; color: #92400e; font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Phản hồi từ người bán:</p>
                    <p style="margin-top: 8px; margin-bottom: 0; color: #111827; font-size: 16px;">
                    "${answer}"
                    </p>
                </div>

                <div style="text-align: center; margin-bottom: 10px;">
                    <a href="${productUrl}" 
                    style="display: inline-block; background-color: #f59e0b; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; font-size: 16px; transition: background-color 0.3s ease; box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);">
                    Xem lại sản phẩm
                    </a>
                </div>
                
                </div>

                <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                    Email này được gửi tự động từ hệ thống đấu giá.<br>
                    Vui lòng không trả lời trực tiếp email này.
                </p>
                </div>
            </div>
            </div>
        `,
        };

        await transporter.sendMail(mailOptions);
        console.log("Email thông báo trả lời đã được gửi đến:", askerEmail);
    } catch (error) {
        console.error("Lỗi khi gửi email thông báo trả lời:", error);
    }
};

module.exports = {
    sendNewQuestionEmail,
    sendOTPEmail,
    sendAnswerEmail,
    maskName,
};
