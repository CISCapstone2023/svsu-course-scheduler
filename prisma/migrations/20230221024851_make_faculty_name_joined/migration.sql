/*
  Warnings:

  - You are about to drop the column `location` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `GuidelinesFaculty` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `GuidelinesFaculty` table. All the data in the column will be lost.
  - Added the required column `name` to the `GuidelinesFaculty` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Course` DROP COLUMN `location`;

-- AlterTable
ALTER TABLE `GuidelinesFaculty` DROP COLUMN `first_name`,
    DROP COLUMN `last_name`,
    ADD COLUMN `name` VARCHAR(191) NOT NULL;
