# Catatan Akademik - POS Web System

## 1) Struktur Aktor
- Client (Pelanggan): melihat menu, isi cart, membuat order (transaction code + nomor meja).
- Admin/Kasir: validasi order dan proses pembayaran.
- Kitchen: membaca KOT secara real-time dan mengubah status proses masak.

## 2) Pseudocode Algoritma 1 - Receipt and KOT Splitter

```text
FUNCTION splitReceiptAndKotByOrderId(orderId)
  order = QUERY orders JOIN transactions BY orderId
  details = QUERY order_details JOIN menus BY orderId

  IF order not found OR details empty THEN
    RAISE error
  END IF

  INIT receiptItems = []
  INIT kotItems = []

  FOR EACH item IN details
    lineTotal = item.qty * item.price

    PUSH {menu_name, qty, price, lineTotal} TO receiptItems
    PUSH {menu_name, qty, note, station} TO kotItems
  END FOR

  RETURN {
    receipt: {summary(ppn,paymentMethod,subtotal,discount,grandTotal), receiptItems},
    kot: {transaction_id, kotItems}
  }
END FUNCTION
```

## 3) Pseudocode Algoritma 2 - BOM Stock Deduction on Paid

```text
FUNCTION createOrderWithAtomicStockDeduction(payload)
  BEGIN TRANSACTION

  VALIDATE menu exists and available
  LOAD BOM recipes for ordered menu items

  INSERT orders, order_details, transactions
  COMMIT
END FUNCTION

FUNCTION markTransactionPaid(orderId)
  BEGIN TRANSACTION

  LOCK transaction row and all ingredient rows (FOR UPDATE)
  CALCULATE required ingredient totals from recipes

  FOR EACH requiredIngredient
    IF stock < needed THEN
      ROLLBACK + ERROR "Bahan baku [Nama Bahan] habis"
    END IF
  END FOR

  FOR EACH requiredIngredient
    UPDATE ingredients stock = stock - needed
    INSERT stock_movements OUT
  END FOR

  UPDATE transactions SET status = PAID
  UPDATE orders SET status = PROCESSING
  COMMIT
END FUNCTION
```

## 4) Catatan Keamanan Akademis
- SQL Injection prevention:
  - Gunakan prepared statements (`?`) untuk semua parameter SQL.
  - Jangan lakukan string concatenation untuk data dari user.
- Race condition prevention saat jam sibuk checkout bersamaan:
  - Gunakan database transaction (`BEGIN`, `COMMIT`, `ROLLBACK`).
  - Lock data penting pakai `SELECT ... FOR UPDATE` sebelum update stok.
  - Validasi stok setelah lock, bukan sebelum lock.
- Data consistency:
  - Gunakan status order yang jelas (`PENDING`, `PROCESSING`, `COMPLETED`, `CANCELLED`).
  - Hindari pembayaran ganda dengan cek status dalam transaksi yang sama.
