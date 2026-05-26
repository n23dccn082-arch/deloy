package com.doan.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    @Autowired
    private JavaMailSender mailSender;

    // Lưu trữ OTP tạm thời trong bộ nhớ: email -> OTP. 
    // Trong thực tế có thể dùng Redis hoặc Database.
    private final Map<String, OtpData> otpStorage = new ConcurrentHashMap<>();

    private static class OtpData {
        String otp;
        long expiresAt;

        OtpData(String otp, long expiresAt) {
            this.otp = otp;
            this.expiresAt = expiresAt;
        }
    }

    public String generateAndSendOtp(String toEmail) {
        // Sinh mã 6 số ngẫu nhiên
        String otp = String.format("%06d", new Random().nextInt(999999));
        
        // Thời gian hết hạn là 5 phút (5 * 60 * 1000 ms)
        long expiresAt = System.currentTimeMillis() + (5 * 60 * 1000);
        otpStorage.put(toEmail, new OtpData(otp, expiresAt));

        // Gửi email
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("binpro015@gmail.com");
        message.setTo(toEmail);
        message.setSubject("Mã xác nhận quên mật khẩu (OTP) - TaskMaster");
        message.setText("Xin chào,\n\n"
                + "Bạn đã yêu cầu khôi phục mật khẩu. Mã xác nhận (OTP) của bạn là: " + otp + "\n"
                + "Mã này sẽ hết hạn sau 5 phút.\n\n"
                + "Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này.");

        mailSender.send(message);
        
        return otp;
    }

    public boolean verifyOtp(String email, String otp) {
        OtpData data = otpStorage.get(email);
        if (data == null) {
            return false;
        }
        
        // Kiểm tra hết hạn
        if (System.currentTimeMillis() > data.expiresAt) {
            otpStorage.remove(email);
            return false;
        }
        
        // Kiểm tra mã OTP
        if (data.otp.equals(otp)) {
            otpStorage.remove(email); // Xóa sau khi xác nhận thành công
            return true;
        }
        
        return false;
    }
}
