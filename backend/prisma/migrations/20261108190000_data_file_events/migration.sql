CREATE TABLE "Data_File_Event" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "correlationId" TEXT NOT NULL,
    "sha256" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    CONSTRAINT "Data_File_Event_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Data_File_Event_eventId_key" ON "Data_File_Event"("eventId");
CREATE INDEX "Data_File_Event_status_receivedAt_idx" ON "Data_File_Event"("status", "receivedAt");
