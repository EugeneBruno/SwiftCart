/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `order` ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `user` ADD COLUMN `address` VARCHAR(191) NOT NULL DEFAULT 'N/A',
    ADD COLUMN `firstName` VARCHAR(191) NOT NULL DEFAULT 'John',
    ADD COLUMN `lastName` VARCHAR(191) NOT NULL DEFAULT 'Doe',
    ADD COLUMN `phone` VARCHAR(191) NOT NULL DEFAULT '0000000000',
    ADD COLUMN `username` VARCHAR(191) NOT NULL DEFAULT 'placeholder_username';

-- CreateIndex
CREATE UNIQUE INDEX `User_username_key` ON `User`(`username`);
