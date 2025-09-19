-- CreateTable
CREATE TABLE "public"."BrandConfig" (
    "id" TEXT NOT NULL,
    "singleton" TEXT NOT NULL DEFAULT 'main',
    "name" TEXT NOT NULL,
    "colors" JSONB NOT NULL,
    "social" JSONB NOT NULL,
    "contact" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BrandConfig_singleton_key" ON "public"."BrandConfig"("singleton");
