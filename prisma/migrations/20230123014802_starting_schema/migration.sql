-- CreateTable
CREATE TABLE `Permission` (
    `tuid` VARCHAR(191) NOT NULL,
    `user_tuid` VARCHAR(191) NOT NULL,
    `id` ENUM('DEPARTMENT_CHAIR', 'ADMIN', 'DEFAULT') NOT NULL DEFAULT 'DEFAULT',

    PRIMARY KEY (`tuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Course` (
    `tuid` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `section_id` INTEGER NOT NULL,
    `revision_tuid` VARCHAR(191) NOT NULL,
    `term` INTEGER NOT NULL,
    `div` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `course_number` VARCHAR(191) NOT NULL,
    `section` VARCHAR(191) NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `credits` INTEGER NOT NULL,
    `title` VARCHAR(30) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Active',
    `faculty_tuid` VARCHAR(191) NOT NULL,
    `instruction_method` VARCHAR(3) NOT NULL DEFAULT 'LEC',
    `capacity` INTEGER NOT NULL,
    `original_state` ENUM('UNMODIFIED', 'MODIFIED', 'ADDED', 'REMOVED') NOT NULL,
    `state` ENUM('UNMODIFIED', 'MODIFIED', 'ADDED', 'REMOVED') NOT NULL,
    `location` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`tuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Schedule` (
    `tuid` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`tuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ScheduleRevision` (
    `tuid` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `file` BLOB NOT NULL,
    `schedule_tuid` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`tuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CourseLocation` (
    `tuid` VARCHAR(191) NOT NULL,
    `start_time` DATETIME(3) NOT NULL,
    `end_time` DATETIME(3) NOT NULL,
    `day_monday` BOOLEAN NOT NULL,
    `day_tuesday` BOOLEAN NOT NULL,
    `day_wednesday` BOOLEAN NOT NULL,
    `day_thursday` BOOLEAN NOT NULL,
    `day_friday` BOOLEAN NOT NULL,
    `day_saturday` BOOLEAN NOT NULL,
    `day_sunday` BOOLEAN NOT NULL,
    `is_online` BOOLEAN NOT NULL,

    PRIMARY KEY (`tuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GuidelinesFaculty` (
    `tuid` VARCHAR(191) NOT NULL,
    `suffix` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NOT NULL,
    `first_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `is_adjunct` BOOLEAN NOT NULL,

    PRIMARY KEY (`tuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GuidelinesFacultyToCourse` (
    `tuid` VARCHAR(191) NOT NULL,
    `faculty_tuid` VARCHAR(191) NOT NULL,
    `course_tuid` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`tuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GuidelinesCourses` (
    `tuid` VARCHAR(191) NOT NULL,
    `cycle` BOOLEAN NOT NULL,
    `credits` INTEGER NOT NULL,
    `meeting_amount` INTEGER NOT NULL,

    PRIMARY KEY (`tuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GuidelinesCoursesTimes` (
    `tuid` VARCHAR(191) NOT NULL,
    `guideline_id` VARCHAR(191) NOT NULL,
    `start_time` DATETIME(3) NOT NULL,
    `end_time` DATETIME(3) NOT NULL,

    PRIMARY KEY (`tuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GuidelinesCoursesDays` (
    `tuid` VARCHAR(191) NOT NULL,
    `guideline_id` VARCHAR(191) NOT NULL,
    `day_monday` BOOLEAN NOT NULL,
    `day_tuesday` BOOLEAN NOT NULL,
    `day_wednesday` BOOLEAN NOT NULL,
    `day_thursday` BOOLEAN NOT NULL,
    `day_friday` BOOLEAN NOT NULL,
    `day_saturday` BOOLEAN NOT NULL,
    `day_sunday` BOOLEAN NOT NULL,

    PRIMARY KEY (`tuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CourseNote` (
    `tuid` VARCHAR(191) NOT NULL,
    `note` TEXT NOT NULL,
    `type` ENUM('ACAMDEMIC_AFFAIRS', 'DEPARTMENT', 'CHANGES') NOT NULL,
    `course_tuid` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`tuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GuidelineBuilding` (
    `tuid` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `prefix` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`tuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GuidelineCampus` (
    `tuid` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`tuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Room` (
    `tuid` VARCHAR(191) NOT NULL,
    `room` VARCHAR(191) NOT NULL,
    `building_tuid` VARCHAR(191) NOT NULL,
    `campus_tuid` VARCHAR(191) NOT NULL,
    `course_tuid` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`tuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Permission` ADD CONSTRAINT `Permission_user_tuid_fkey` FOREIGN KEY (`user_tuid`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Course` ADD CONSTRAINT `Course_revision_tuid_fkey` FOREIGN KEY (`revision_tuid`) REFERENCES `ScheduleRevision`(`tuid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScheduleRevision` ADD CONSTRAINT `ScheduleRevision_schedule_tuid_fkey` FOREIGN KEY (`schedule_tuid`) REFERENCES `Schedule`(`tuid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GuidelinesFacultyToCourse` ADD CONSTRAINT `GuidelinesFacultyToCourse_faculty_tuid_fkey` FOREIGN KEY (`faculty_tuid`) REFERENCES `GuidelinesFaculty`(`tuid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GuidelinesFacultyToCourse` ADD CONSTRAINT `GuidelinesFacultyToCourse_course_tuid_fkey` FOREIGN KEY (`course_tuid`) REFERENCES `Course`(`tuid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GuidelinesCoursesTimes` ADD CONSTRAINT `GuidelinesCoursesTimes_guideline_id_fkey` FOREIGN KEY (`guideline_id`) REFERENCES `GuidelinesCourses`(`tuid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GuidelinesCoursesDays` ADD CONSTRAINT `GuidelinesCoursesDays_guideline_id_fkey` FOREIGN KEY (`guideline_id`) REFERENCES `GuidelinesCourses`(`tuid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CourseNote` ADD CONSTRAINT `CourseNote_course_tuid_fkey` FOREIGN KEY (`course_tuid`) REFERENCES `Course`(`tuid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Room` ADD CONSTRAINT `Room_building_tuid_fkey` FOREIGN KEY (`building_tuid`) REFERENCES `GuidelineBuilding`(`tuid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Room` ADD CONSTRAINT `Room_campus_tuid_fkey` FOREIGN KEY (`campus_tuid`) REFERENCES `GuidelineCampus`(`tuid`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Room` ADD CONSTRAINT `Room_course_tuid_fkey` FOREIGN KEY (`course_tuid`) REFERENCES `Course`(`tuid`) ON DELETE CASCADE ON UPDATE CASCADE;
