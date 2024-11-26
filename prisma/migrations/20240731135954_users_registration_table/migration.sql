-- CreateTable
CREATE TABLE "user_registration" (
    "id" SERIAL NOT NULL,
    "fullname" VARCHAR(255) NOT NULL,
    "father_name" VARCHAR(255),
    "mother_name" VARCHAR(255),
    "mobile_number" VARCHAR(10),
    "email" TEXT NOT NULL,
    "dob" VARCHAR(255) NOT NULL,
    "place_of_birth" VARCHAR(255),
    "marital_status" VARCHAR(255),
    "nationality" VARCHAR(255),
    "present_add" VARCHAR(255),
    "permanent_add" VARCHAR(255),
    "isactive" BOOLEAN DEFAULT false,

    CONSTRAINT "user_registration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_registration_email_key" ON "user_registration"("email");
