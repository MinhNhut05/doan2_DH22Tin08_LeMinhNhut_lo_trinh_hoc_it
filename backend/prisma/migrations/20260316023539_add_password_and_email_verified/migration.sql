-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "password_hash" TEXT;

-- RenameIndex
ALTER INDEX "refresh_tokens_token_idx" RENAME TO "refresh_tokens_token_hash_idx";

-- RenameIndex
ALTER INDEX "refresh_tokens_token_key" RENAME TO "refresh_tokens_token_hash_key";
