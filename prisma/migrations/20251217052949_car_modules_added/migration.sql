-- CreateTable
CREATE TABLE `Car` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `make_name` VARCHAR(191) NOT NULL,
    `model_name` VARCHAR(191) NOT NULL,
    `trim_name` VARCHAR(191) NULL,
    `trim_description` VARCHAR(191) NULL,
    `engine_type` VARCHAR(191) NOT NULL,
    `engine_fuel_type` VARCHAR(191) NULL,
    `engine_cylinders` INTEGER NULL,
    `engine_size` DOUBLE NULL,
    `engine_horsepower_hp` INTEGER NULL,
    `engine_horsepower_rpm` INTEGER NULL,
    `engine_drive_type` VARCHAR(191) NULL,
    `body_type` VARCHAR(191) NOT NULL,
    `body_doors` INTEGER NULL,
    `body_seats` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
