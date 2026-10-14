-- AlterTable
ALTER TABLE "matches" ADD COLUMN IF NOT EXISTS "predictionCutoff" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "players" ADD COLUMN IF NOT EXISTS "phone" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "predictions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "selectedOutcome" TEXT,
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "comment" TEXT,
    "isCorrect" BOOLEAN,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "prediction_reports" (
    "id" TEXT NOT NULL,
    "predictionId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prediction_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ai_analyses" (
    "id" TEXT NOT NULL,
    "matchId" TEXT,
    "scope" TEXT NOT NULL DEFAULT 'match',
    "analysisType" TEXT NOT NULL,
    "model" TEXT,
    "promptVersion" TEXT,
    "sourceRef" TEXT,
    "content" TEXT NOT NULL,
    "structured" JSONB,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedBy" TEXT,
    "publishedAt" TIMESTAMP(3),
    "stale" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ai_jobs" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "resultId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "player_imports" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "uploadedByAdminId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "totalRows" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reportJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "player_imports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "predictions_userId_matchId_type_key" ON "predictions"("userId", "matchId", "type");
CREATE INDEX IF NOT EXISTS "predictions_matchId_idx" ON "predictions"("matchId");
CREATE INDEX IF NOT EXISTS "predictions_userId_idx" ON "predictions"("userId");
CREATE INDEX IF NOT EXISTS "prediction_reports_status_idx" ON "prediction_reports"("status");
CREATE INDEX IF NOT EXISTS "ai_analyses_matchId_idx" ON "ai_analyses"("matchId");
CREATE INDEX IF NOT EXISTS "ai_analyses_status_idx" ON "ai_analyses"("status");
CREATE INDEX IF NOT EXISTS "ai_jobs_status_availableAt_idx" ON "ai_jobs"("status", "availableAt");
CREATE INDEX IF NOT EXISTS "player_imports_teamId_idx" ON "player_imports"("teamId");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "predictions" ADD CONSTRAINT "predictions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "predictions" ADD CONSTRAINT "predictions_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "prediction_reports" ADD CONSTRAINT "prediction_reports_predictionId_fkey" FOREIGN KEY ("predictionId") REFERENCES "predictions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "prediction_reports" ADD CONSTRAINT "prediction_reports_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "ai_analyses" ADD CONSTRAINT "ai_analyses_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
