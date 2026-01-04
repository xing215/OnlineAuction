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

        const subject = type === "register" 
            ? "Mã OTP xác thực đăng ký" 
            : "Mã OTP khôi phục mật khẩu";
        
        const description = type === "register"
            ? "Bạn đã thực hiện đăng ký tài khoản. Đây là mã xác thực của bạn:"
            : "Bạn đã yêu cầu khôi phục mật khẩu. Đây là mã xác thực của bạn:";
        
        const footer = type === "register"
            ? "Nếu bạn không thực hiện đăng ký, vui lòng bỏ qua email này."
            : "Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này.";

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
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
                          ${description}
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
                          ${footer}
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
 
const sendBannedBidderEmail = async ({
    userEmail,
    userName,
    productName,
    productId,
    sellerName,
}) => {
    try {
        const transporter = createTransport();

        const maskedSellerName = maskName(sellerName);
        const productUrl = `${process.env.FRONTEND_URL}/products/${productId}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `Thông báo: Bạn đã bị hạn chế đặt giá cho sản phẩm "${productName}"`,
            html: `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 30px 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                
                <div style="background-color: #ef4444; height: 6px; width: 100%;"></div>
                
                <div style="padding: 40px 30px;">
                <h2 style="color: #111827; margin-top: 0; margin-bottom: 20px; font-size: 24px; font-weight: 700;">
                    Thông báo hạn chế đặt giá
                </h2>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                    Xin chào <strong>${userName}</strong>,<br>
                    Người bán <strong>${maskedSellerName}</strong> đã hạn chế bạn đặt giá cho sản phẩm <strong style="color: #dc2626;">${productName}</strong>.
                </p>

                <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 4px; margin-bottom: 30px;">
                    <p style="margin: 0; color: #991b1b; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Lưu ý:</p>
                    <p style="margin-top: 10px; margin-bottom: 0; color: #1f2937; font-size: 15px;">
                    Bạn không thể tiếp tục đặt giá cho sản phẩm này. Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ với người bán hoặc bộ phận hỗ trợ.
                    </p>
                </div>

                <div style="text-align: center; margin-bottom: 10px;">
                    <a href="${productUrl}" 
                    style="display: inline-block; background-color: #6b7280; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; font-size: 16px; transition: background-color 0.3s ease; box-shadow: 0 2px 4px rgba(107, 114, 128, 0.3);">
                    Xem sản phẩm
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
        console.log("Email thông báo bị cấm đã được gửi đến:", userEmail);
    } catch (error) {
        console.error("Lỗi khi gửi email thông báo bị cấm:", error);
    }
};

const sendUnbannedBidderEmail = async ({
    userEmail,
    userName,
    productName,
    productId,
    sellerName,
}) => {
    try {
        const transporter = createTransport();

        const maskedSellerName = maskName(sellerName);
        const productUrl = `${process.env.FRONTEND_URL}/products/${productId}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `Thông báo: Bạn đã được phép đặt giá lại cho sản phẩm "${productName}"`,
            html: `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 30px 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                
                <div style="background-color: #10b981; height: 6px; width: 100%;"></div>
                
                <div style="padding: 40px 30px;">
                <h2 style="color: #111827; margin-top: 0; margin-bottom: 20px; font-size: 24px; font-weight: 700;">
                    Đã bỏ hạn chế đặt giá
                </h2>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                    Xin chào <strong>${userName}</strong>,<br>
                    Người bán <strong>${maskedSellerName}</strong> đã bỏ hạn chế đặt giá cho bạn đối với sản phẩm <strong style="color: #059669;">${productName}</strong>.
                </p>

                <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; border-radius: 4px; margin-bottom: 30px;">
                    <p style="margin: 0; color: #065f46; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Thông báo:</p>
                    <p style="margin-top: 10px; margin-bottom: 0; color: #1f2937; font-size: 15px;">
                    Bạn hiện đã có thể tham gia đặt giá cho sản phẩm này. Vui lòng tuân thủ quy định đấu giá để tránh bị hạn chế trong tương lai.
                    </p>
                </div>

                <div style="text-align: center; margin-bottom: 10px;">
                    <a href="${productUrl}" 
                    style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; font-size: 16px; transition: background-color 0.3s ease; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);">
                    Xem sản phẩm và đặt giá
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
        console.log("Email thông báo bỏ cấm đã được gửi đến:", userEmail);
    } catch (error) {
        console.error("Lỗi khi gửi email thông báo bỏ cấm:", error);
    }
};

const sendNewBidToSellerEmail = async ({
    sellerEmail,
    sellerName,
    productName,
    productId,
    bidderName,
    bidAmount,
    bidCount,
}) => {
    try {
        const transporter = createTransport();
        const maskedBidderName = maskName(bidderName);
        const productUrl = `${process.env.FRONTEND_URL}/products/${productId}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: sellerEmail,
            subject: `Có lượt đặt giá mới cho sản phẩm "${productName}"`,
            html: `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 30px 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <div style="background-color: #f59e0b; height: 6px; width: 100%;"></div>
                <div style="padding: 40px 30px;">
                <h2 style="color: #111827; margin-top: 0; margin-bottom: 20px; font-size: 24px; font-weight: 700;">
                    Lượt đặt giá mới!
                </h2>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                    Xin chào <strong>${sellerName}</strong>,<br>
                    <strong>${maskedBidderName}</strong> vừa đặt giá cho sản phẩm <strong style="color: #d97706;">${productName}</strong>.
                </p>
                <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 4px; margin-bottom: 20px;">
                    <p style="margin: 0; color: #92400e; font-weight: 600; font-size: 14px;">Giá đặt mới:</p>
                    <p style="margin-top: 8px; margin-bottom: 0; color: #111827; font-size: 24px; font-weight: 700;">
                    ${bidAmount.toLocaleString('vi-VN')}đ
                    </p>
                    <p style="margin-top: 8px; margin-bottom: 0; color: #6b7280; font-size: 14px;">
                    Tổng số lượt đặt giá: <strong>${bidCount}</strong>
                    </p>
                </div>
                <div style="text-align: center; margin-bottom: 10px;">
                    <a href="${productUrl}" 
                    style="display: inline-block; background-color: #f59e0b; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; font-size: 16px; box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);">
                    Xem chi tiết sản phẩm
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
    } catch (error) {
        console.error("Lỗi khi gửi email cho người bán:", error);
    }
};

const sendNewBidToCurrentBidderEmail = async ({
    bidderEmail,
    bidderName,
    productName,
    productId,
    bidAmount,
    isLeading,
}) => {
    try {
        const transporter = createTransport();
        const productUrl = `${process.env.FRONTEND_URL}/products/${productId}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: bidderEmail,
            subject: `Xác nhận đặt giá: ${productName}`,
            html: `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 30px 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <div style="background-color: #10b981; height: 6px; width: 100%;"></div>
                <div style="padding: 40px 30px;">
                <h2 style="color: #111827; margin-top: 0; margin-bottom: 20px; font-size: 24px; font-weight: 700;">
                    Đặt giá thành công!
                </h2>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                    Xin chào <strong>${bidderName}</strong>,<br>
                    Bạn đã đặt giá thành công cho sản phẩm <strong style="color: #059669;">${productName}</strong>.
                </p>
                <div style="background-color: ${isLeading ? '#ecfdf5' : '#fef3c7'}; border-left: 4px solid ${isLeading ? '#10b981' : '#f59e0b'}; padding: 20px; border-radius: 4px; margin-bottom: 20px;">
                    <p style="margin: 0; color: ${isLeading ? '#065f46' : '#92400e'}; font-weight: 600; font-size: 14px;">Giá của bạn:</p>
                    <p style="margin-top: 8px; margin-bottom: 0; color: #111827; font-size: 24px; font-weight: 700;">
                    ${bidAmount.toLocaleString('vi-VN')}đ
                </div>
                <div style="text-align: center; margin-bottom: 10px;">
                    <a href="${productUrl}" 
                    style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; font-size: 16px; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);">
                    Theo dõi sản phẩm
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
    } catch (error) {
        console.error("Lỗi khi gửi email xác nhận đặt giá:", error);
    }
};

const sendOutbidEmail = async ({
    bidderEmail,
    bidderName,
    productName,
    productId,
    previousBidAmount,
    newBidAmount,
}) => {
    try {
        const transporter = createTransport();
        const productUrl = `${process.env.FRONTEND_URL}/products/${productId}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: bidderEmail,
            subject: `Có người đặt giá cao hơn: ${productName}`,
            html: `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 30px 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <div style="background-color: #ef4444; height: 6px; width: 100%;"></div>
                <div style="padding: 40px 30px;">
                <h2 style="color: #111827; margin-top: 0; margin-bottom: 20px; font-size: 24px; font-weight: 700;">
                    Bạn không còn dẫn đầu!
                </h2>
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                    Xin chào <strong>${bidderName}</strong>,<br>
                    Có người vừa đặt giá cao hơn bạn cho sản phẩm <strong style="color: #dc2626;">${productName}</strong>.
                </p>
                <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 4px; margin-bottom: 20px;">
                    <div style="margin-bottom: 12px;">
                        <p style="margin: 0; color: #991b1b; font-weight: 600; font-size: 13px;">Giá của bạn:</p>
                        <p style="margin-top: 4px; margin-bottom: 0; color: #6b7280; font-size: 18px; font-weight: 600;">
                        ${previousBidAmount.toLocaleString('vi-VN')}đ
                        </p>
                    </div>
                    <div>
                        <p style="margin: 0; color: #991b1b; font-weight: 600; font-size: 13px;">Giá hiện tại:</p>
                        <p style="margin-top: 4px; margin-bottom: 0; color: #111827; font-size: 20px; font-weight: 700;">
                        ${newBidAmount.toLocaleString('vi-VN')}đ
                        </p>
                    </div>
                </div>
                <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
                    Đặt giá ngay để tiếp tục cạnh tranh cho sản phẩm này!
                </p>
                <div style="text-align: center; margin-bottom: 10px;">
                    <a href="${productUrl}" 
                    style="display: inline-block; background-color: #ef4444; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; font-size: 16px; box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);">
                    Đặt giá ngay
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
    } catch (error) {
        console.error("Lỗi khi gửi email thông báo outbid:", error);
    }
};

const sendAuctionExpiredEmail = async ({
    sellerEmail,
    sellerName,
    productName,
    productId,
}) => {
    try {
        const transporter = createTransport();
        const productUrl = `${process.env.FRONTEND_URL}/products/${productId}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: sellerEmail,
            subject: `Đấu giá kết thúc: Không có người đặt giá cho "${productName}"`,
            html: `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 30px 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                
                <div style="background-color: #6b7280; height: 6px; width: 100%;"></div>
                
                <div style="padding: 40px 30px;">
                <h2 style="color: #111827; margin-top: 0; margin-bottom: 20px; font-size: 24px; font-weight: 700;">
                    Đấu giá đã kết thúc
                </h2>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                    Xin chào <strong>${sellerName}</strong>,<br>
                    Đấu giá cho sản phẩm <strong style="color: #374151;">${productName}</strong> đã kết thúc.
                </p>

                <div style="background-color: #f3f4f6; border-left: 4px solid #6b7280; padding: 20px; border-radius: 4px; margin-bottom: 30px;">
                    <p style="margin: 0; color: #4b5563; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Trạng thái:</p>
                    <p style="margin-top: 10px; margin-bottom: 0; color: #1f2937; font-size: 15px;">
                    Không có người tham gia đặt giá cho sản phẩm này. Bạn có thể đăng lại sản phẩm hoặc điều chỉnh giá khởi điểm để thu hút nhiều người quan tâm hơn.
                    </p>
                </div>

                <div style="text-align: center; margin-bottom: 10px;">
                    <a href="${productUrl}" 
                    style="display: inline-block; background-color: #6b7280; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; font-size: 16px; transition: background-color 0.3s ease; box-shadow: 0 2px 4px rgba(107, 114, 128, 0.3);">
                    Xem chi tiết sản phẩm
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
        console.log("Email thông báo đấu giá hết hạn đã được gửi đến:", sellerEmail);
    } catch (error) {
        console.error("Lỗi khi gửi email thông báo đấu giá hết hạn:", error);
    }
};

const sendAuctionEndedToSellerEmail = async ({
    sellerEmail,
    sellerName,
    productName,
    productId,
    winnerName,
    finalPrice,
}) => {
    try {
        const transporter = createTransport();
        const maskedWinnerName = maskName(winnerName);
        const productUrl = `${process.env.FRONTEND_URL}/products/${productId}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: sellerEmail,
            subject: `Chúc mừng! Sản phẩm "${productName}" đã được bán`,
            html: `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 30px 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                
                <div style="background-color: #10b981; height: 6px; width: 100%;"></div>
                
                <div style="padding: 40px 30px;">
                <h2 style="color: #111827; margin-top: 0; margin-bottom: 20px; font-size: 24px; font-weight: 700;">
                    Đấu giá thành công!
                </h2>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                    Xin chào <strong>${sellerName}</strong>,<br>
                    Sản phẩm <strong style="color: #059669;">${productName}</strong> của bạn đã được bán thành công!
                </p>

                <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; border-radius: 4px; margin-bottom: 20px;">
                    <p style="margin: 0; color: #065f46; font-weight: 600; font-size: 14px;">Thông tin người thắng:</p>
                    <p style="margin-top: 8px; margin-bottom: 12px; color: #111827; font-size: 15px;">
                    <strong>${maskedWinnerName}</strong>
                    </p>
                    <p style="margin: 0; color: #065f46; font-weight: 600; font-size: 14px;">Giá thành công:</p>
                    <p style="margin-top: 8px; margin-bottom: 0; color: #111827; font-size: 24px; font-weight: 700;">
                    ${finalPrice.toLocaleString('vi-VN')}đ
                    </p>
                </div>

                <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px 20px; border-radius: 4px; margin-bottom: 30px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px;">
                    Đơn hàng đã được tạo tự động. Vui lòng liên hệ với người mua để hoàn tất giao dịch.
                    </p>
                </div>

                <div style="text-align: center; margin-bottom: 10px;">
                    <a href="${productUrl}" 
                    style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; font-size: 16px; transition: background-color 0.3s ease; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);">
                    Xem chi tiết đơn hàng
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
        console.log("Email thông báo đấu giá kết thúc đã được gửi đến người bán:", sellerEmail);
    } catch (error) {
        console.error("Lỗi khi gửi email thông báo đấu giá kết thúc cho người bán:", error);
    }
};

const sendAuctionWonEmail = async ({
    winnerEmail,
    winnerName,
    productName,
    productId,
    finalPrice,
    sellerName,
}) => {
    try {
        const transporter = createTransport();
        const maskedSellerName = maskName(sellerName);
        const productUrl = `${process.env.FRONTEND_URL}/products/${productId}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: winnerEmail,
            subject: `Chúc mừng! Bạn đã thắng sản phẩm "${productName}"`,
            html: `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 30px 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                
                <div style="background-color: #f59e0b; height: 6px; width: 100%;"></div>
                
                <div style="padding: 40px 30px;">
                <h2 style="color: #111827; margin-top: 0; margin-bottom: 20px; font-size: 24px; font-weight: 700;">
                    Chúc mừng! Bạn đã thắng đấu giá
                </h2>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                    Xin chào <strong>${winnerName}</strong>,<br>
                    Bạn đã thắng đấu giá cho sản phẩm <strong style="color: #d97706;">${productName}</strong>!
                </p>

                <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 4px; margin-bottom: 20px;">
                    <p style="margin: 0; color: #92400e; font-weight: 600; font-size: 14px;">Người bán:</p>
                    <p style="margin-top: 8px; margin-bottom: 12px; color: #111827; font-size: 15px;">
                    <strong>${maskedSellerName}</strong>
                    </p>
                    <p style="margin: 0; color: #92400e; font-weight: 600; font-size: 14px;">Giá thắng:</p>
                    <p style="margin-top: 8px; margin-bottom: 0; color: #111827; font-size: 24px; font-weight: 700;">
                    ${finalPrice.toLocaleString('vi-VN')}đ
                    </p>
                </div>

                <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px 20px; border-radius: 4px; margin-bottom: 30px;">
                    <p style="margin: 0; color: #065f46; font-size: 14px;">
                    Đơn hàng đã được tạo. Vui lòng cung cấp địa chỉ nhận hàng và liên hệ với người bán để hoàn tất giao dịch.
                    </p>
                </div>

                <div style="text-align: center; margin-bottom: 10px;">
                    <a href="${productUrl}" 
                    style="display: inline-block; background-color: #f59e0b; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; font-size: 16px; transition: background-color 0.3s ease; box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);">
                    Xem chi tiết đơn hàng
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
        console.log("Email thông báo thắng đấu giá đã được gửi đến:", winnerEmail);
    } catch (error) {
        console.error("Lỗi khi gửi email thông báo thắng đấu giá:", error);
    }
};

const sendDescriptionUpdateEmail = async ({
    bidderEmail,
    bidderName,
    productName,
    productId,
    sellerName,
}) => {
    try {
        const transporter = createTransport();

        const maskedSellerName = maskName(sellerName);
        const productUrl = `${process.env.FRONTEND_URL}/products/${productId}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: bidderEmail,
            subject: `Cập nhật mô tả sản phẩm: ${productName}`,
            html: `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 30px 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                
                <div style="background-color: #f59e0b; height: 6px; width: 100%;"></div>
                
                <div style="padding: 40px 30px;">
                <h2 style="color: #111827; margin-top: 0; margin-bottom: 20px; font-size: 24px; font-weight: 700;">
                    Thông tin sản phẩm đã được cập nhật!
                </h2>
                
                <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
                    Xin chào <strong>${bidderName}</strong>,<br>
                    Người bán <strong>${maskedSellerName}</strong> vừa cập nhật mô tả cho sản phẩm <strong style="color: #d97706;">${productName}</strong> mà bạn đã từng đấu giá.
                </p>

                <div style="text-align: center; margin-bottom: 10px;">
                    <a href="${productUrl}" 
                    style="display: inline-block; background-color: #f59e0b; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; font-size: 16px; transition: background-color 0.3s ease; box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);">
                    Xem chi tiết sản phẩm
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
            "Email thông báo cập nhật mô tả đã được gửi đến:",
            bidderEmail
        );
    } catch (error) {
        console.error("Lỗi khi gửi email thông báo cập nhật mô tả:", error);
    }
};

const sendAccountDeletedEmail = async ({ userEmail, userName }) => {
    try {
        const transporter = createTransport();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: "Tài khoản của bạn đã bị xóa",
            html: `
            <div style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 30px 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                
                <div style="background-color: #dc2626; height: 6px; width: 100%;"></div>
                
                <div style="padding: 40px 30px;">
                <h2 style="color: #111827; margin-top: 0; margin-bottom: 20px; font-size: 24px; font-weight: 700;">
                    Tài khoản của bạn đã bị xóa
                </h2>
                
                <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                    Xin chào <strong>${userName}</strong>,
                </p>
                
                <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                    Chúng tôi rất tiếc phải thông báo rằng tài khoản của bạn trên nền tảng đấu giá trực tuyến đã bị xóa bởi quản trị viên.
                </p>
                
                <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                    Nếu bạn tin rằng đây là một lỗi hoặc có bất kỳ câu hỏi nào, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi.
                </p>
                
                <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0;">
                    <p style="color: #991b1b; font-size: 14px; margin: 0; font-weight: 500;">
                        Lưu ý: Bạn sẽ không thể truy cập vào tài khoản này nữa. Tất cả dữ liệu liên quan đã được xóa vĩnh viễn.
                    </p>
                </div>
                
                <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                    Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.
                </p>
                
                <div style="text-align: center; margin-top: 30px;">
                    <a href="${process.env.FRONTEND_URL}" style="background-color: #f59e0b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                        Truy cập trang web
                    </a>
                </div>
                </div>
                
                <div style="background-color: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb;">
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                    Email này được gửi tự động từ hệ thống đấu giá trực tuyến. Vui lòng không trả lời email này.
                </p>
                </div>
            </div>
            </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log("Email thông báo xóa tài khoản đã được gửi đến:", userEmail);
    } catch (error) {
        console.error("Lỗi khi gửi email thông báo xóa tài khoản:", error);
    }
};

module.exports = {
    sendNewQuestionEmail,
    sendOTPEmail,
    sendAnswerEmail,
    sendBannedBidderEmail,
    sendUnbannedBidderEmail,
    sendNewBidToSellerEmail,
    sendNewBidToCurrentBidderEmail,
    sendOutbidEmail,
    sendAuctionExpiredEmail,
    sendAuctionEndedToSellerEmail,
    sendAuctionWonEmail,
    sendDescriptionUpdateEmail,
    sendAccountDeletedEmail,
    maskName,
};
