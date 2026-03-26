-- AlterTable
ALTER TABLE "learner_profiles" ADD COLUMN     "main_learning_path_id" TEXT;

-- CreateTable
CREATE TABLE "pending_onboarding_rounds" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "round_number" INTEGER NOT NULL,
    "dismiss_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pending_onboarding_rounds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pending_onboarding_rounds_user_id_idx" ON "pending_onboarding_rounds"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "pending_onboarding_rounds_user_id_round_number_key" ON "pending_onboarding_rounds"("user_id", "round_number");

-- AddForeignKey
ALTER TABLE "learner_profiles" ADD CONSTRAINT "learner_profiles_main_learning_path_id_fkey" FOREIGN KEY ("main_learning_path_id") REFERENCES "learning_paths"("id") ON DELETE SET NULL ON UPDATE CASCADE;
