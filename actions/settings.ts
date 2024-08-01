"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";

import { unstable_update } from "@/auth";
import { db } from "@/lib/db";
import { SettingsSchema } from "@/schemas";
import { getUserByEmail, getUserById } from "@/data/user";
import { currentUser } from "@/lib/auth";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

export const settings = async (
  values: z.infer<typeof SettingsSchema>
) => {
  const user = await currentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const dbUser = await getUserById(user.id);

  if (!dbUser) {
    return { error: "Unauthorized" };
  }
  console.log(user.isOAuth)
  if (user.isOAuth) {
    values.email = undefined;
    values.password = undefined;
    values.newPassword = undefined;
  }

  if (values.email && values.email !== user.email) {
    const existingUser = await getUserByEmail(values.email);

    if (existingUser && existingUser.id !== user.id) {
      return { error: "Email already in use!" };
    }

    const verificationToken = await generateVerificationToken(values.email);
    await sendVerificationEmail(verificationToken.email, verificationToken.token);

    return { success: "Verification email sent!" };
  }

  if (values.password && values.newPassword && dbUser.password) {
    const passwordsMatch = await bcrypt.compare(values.password, dbUser.password);

    if (!passwordsMatch) {
      return { error: "Incorrect password!" };
    }

    const hashedPassword = await bcrypt.hash(values.newPassword, 10);
    values.password = hashedPassword;
    values.newPassword = undefined;
  }

  const updateData: any = {
    name: values.name,
    email: values.email,
    password: values.password,
    primarySkill: values.primarySkill,
    secondarySkills: values.secondarySkills,
    country: values.country,
    location: values.location,
    about:values.about,
    projects: values.projects,
    institution: values.institution,
    study: values.study,
    profilePic: values.profilePic,
    emailVerified: dbUser.emailVerified,  // Preserve the emailVerified status
  };

  if (values.posts) {
    updateData.posts = {
      connect: values.posts.map(postId => ({ id: postId })),
    };
  }

  const updatedUser = await db.user.update({
    where: { id: dbUser.id },
    data: updateData,
  });

  unstable_update({
    user: {
      name: updatedUser.name,
      email: updatedUser.email,
    }
  });

  return { success: "Settings Updated!" };
};
