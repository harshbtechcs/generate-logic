-- AlterTable
ALTER TABLE "users" ADD COLUMN     "show_on_leaderboard" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "daily_answers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "selected_option" TEXT,
    "is_correct" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "terminal_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "mission_id" TEXT NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "terminal_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "daily_answers_day_idx" ON "daily_answers"("day");

-- CreateIndex
CREATE UNIQUE INDEX "daily_answers_user_id_day_key" ON "daily_answers"("user_id", "day");

-- CreateIndex
CREATE INDEX "terminal_progress_completed_at_idx" ON "terminal_progress"("completed_at");

-- CreateIndex
CREATE UNIQUE INDEX "terminal_progress_user_id_mission_id_key" ON "terminal_progress"("user_id", "mission_id");

-- AddForeignKey
ALTER TABLE "daily_answers" ADD CONSTRAINT "daily_answers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "terminal_progress" ADD CONSTRAINT "terminal_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
