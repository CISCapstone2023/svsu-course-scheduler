/*
  Warnings:

  - You are about to drop the column `row` on the `Course` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Course` DROP COLUMN `row`,
    ADD COLUMN `excelRow` INTEGER NOT NULL DEFAULT -1;
