/*
  Warnings:

  - Added the required column `dob` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mobile_number` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "dob" VARCHAR(255) NOT NULL,
ADD COLUMN     "father_name" VARCHAR(255),
ADD COLUMN     "isactive" BOOLEAN DEFAULT false,
ADD COLUMN     "marital_status" VARCHAR(255),
ADD COLUMN     "mobile_number" VARCHAR(10) NOT NULL,
ADD COLUMN     "mother_name" VARCHAR(255),
ADD COLUMN     "nationality" VARCHAR(255),
ADD COLUMN     "permanent_add" VARCHAR(255),
ADD COLUMN     "place_of_birth" VARCHAR(255),
ADD COLUMN     "present_add" VARCHAR(255);
