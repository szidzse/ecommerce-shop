import crypto from "crypto";
import { NextFunction } from "express";
import { ValidationError } from "../../../../packages/error-handler";
import redis from "../../../../packages/libs/redis";
import { sendEmail } from "../utils/sendMail";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationData = (
  data: any,
  userType: "user" | "seller",
) => {
  const { name, email, password, phoneNumber, country } = data;

  if (
    !name ||
    !email ||
    !password ||
    (userType === "seller" && (!phoneNumber || !country))
  ) {
    throw new ValidationError("Missing required fields!");
  }

  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email format!");
  }
};

export const checkOtpRestrictions = (email: string, next: NextFunction) => {};

export const sendOtp = async (
  name: string,
  email: string,
  template: string,
) => {
  const otp = crypto.randomInt(1000, 9999).toString();
  await sendEmail(email, "Verify Your Email", template, { name, otp });
  await redis.set(`otp:${email}`, otp, "EX", 300);
  await redis.set(`otp_cooldown:${email}`, "true", "EX", 60);
};
