-- AlterTable
ALTER TABLE "Store" ALTER COLUMN "cellphone_second" DROP NOT NULL,
ALTER COLUMN "facebook" DROP NOT NULL,
ALTER COLUMN "instagram" DROP NOT NULL,
ALTER COLUMN "another" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "senha" TEXT;
