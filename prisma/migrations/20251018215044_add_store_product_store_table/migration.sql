-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "nr" INTEGER NOT NULL,
    "neighbr" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" INTEGER NOT NULL,
    "lat" INTEGER NOT NULL,
    "lon" INTEGER NOT NULL,
    "owner_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cellphone" INTEGER NOT NULL,
    "cellphone_second" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "facebook" TEXT NOT NULL,
    "instagram" TEXT NOT NULL,
    "another" TEXT NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductStore" (
    "id" TEXT NOT NULL,
    "id_store" TEXT NOT NULL,
    "id_product" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "ProductStore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductStore_id_store_id_product_key" ON "ProductStore"("id_store", "id_product");

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductStore" ADD CONSTRAINT "ProductStore_id_store_fkey" FOREIGN KEY ("id_store") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductStore" ADD CONSTRAINT "ProductStore_id_product_fkey" FOREIGN KEY ("id_product") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
