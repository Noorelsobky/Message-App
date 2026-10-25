-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "imagePath" TEXT,
ALTER COLUMN "content" DROP NOT NULL;
