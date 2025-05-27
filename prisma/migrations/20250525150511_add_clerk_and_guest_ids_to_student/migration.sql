/*
  Warnings:

  - A unique constraint covering the columns `[clerkId]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[guestSessionId]` on the table `Student` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Submission` DROP FOREIGN KEY `Submission_studentId_fkey`;

-- DropIndex
DROP INDEX `Student_name_key` ON `Student`;

-- DropIndex
DROP INDEX `Submission_studentId_fkey` ON `Submission`;

-- AlterTable
ALTER TABLE `Student` ADD COLUMN `clerkId` VARCHAR(191) NULL,
    ADD COLUMN `guestSessionId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Student_clerkId_key` ON `Student`(`clerkId`);

-- CreateIndex
CREATE UNIQUE INDEX `Student_guestSessionId_key` ON `Student`(`guestSessionId`);
