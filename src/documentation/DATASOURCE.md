# 📊 Cơ Chế Datasource — Hệ Thống Reporting SmartmoveOS

## 1. 🌟 Mục Tiêu

* Trừu tượng hóa việc truy xuất dữ liệu từ nhiều nguồn: BigQuery, MySQL, Google Sheets,...
* Tách biệt giữa truy vấn dữ liệu và logic hiển thị frontend.
* Tạo trung tâm dữ liệu thống nhất để phục vụ nhiều mục đích: chart, table, export, phân tích...

---

## 2. 📁 Cấu Trúc Mỗi Datasource

Mỗi datasource là một thư mục nằm trong `data-sources/`, ví dụ:

data-sources/
└── BigQuery\_AdjustCohortData/
├── definition.ts
└── query.sql

### 2.1 `definition.ts`

Định nghĩa metadata của datasource:

```ts
export default {
  source: 'bigquery', // hoặc 'mysql', 'sheet', ...
  queryFile: './query.sql',

  dimensions: [
    'app_fullname', 'channel', 'country_code',
    'campaign_name', 'date', 'mmp'
  ],

  metrics: {
    cost: 'SUM',
    imps_D0: 'SUM',
    install: 'SUM',
    RATIO_REVD30_REVD3: 'AVG',
    retained_users_D0: 'SUM',
    retained_users_D1: 'SUM',
    retained_users_D3: 'SUM',
    retained_users_D7: 'SUM',
    retained_users_D30: 'SUM',
    REV_D0: 'SUM',
    REV_D3: 'SUM',
    REV_D7: 'SUM',
    REV_D30: 'SUM',
    REV_D60: 'SUM',
    REV_D90: 'SUM',
    REV_D120: 'SUM'
  }
}
```

✅ Nếu metrics chỉ là mảng, hệ thống sẽ mặc định hiểu là SUM.

---

### 2.2 `query.sql`

Truy vấn gốc trả về dữ liệu chi tiết (không GROUP BY):

```sql
WITH A AS (...) -- query chính
SELECT
  date, channel, campaign_name, cost, REV_D30, ...
FROM A
```

---

## 3. 🔌 API Truy cập Dữ liệu

API tiêu chuẩn:

```
GET /api/data-source/[name]?startDate=20250101&endDate=20250131
```

### Tham số mở rộng:

| Tham số    | Mô tả                                                   |
| ---------- | ------------------------------------------------------- |
| group\_by  | Danh sách dimension cần group                           |
| filter\_by | JSON object chứa filter, VD: `{ country_code: ['VN'] }` |
| metrics    | Danh sách metric cần lấy (nếu null thì lấy tất)         |

---

## 4. ⚙️ Backend Xử Lý

### 4.1 Sinh Query Động

* Đọc `definition.ts` và `query.sql`
* Nếu có `group_by`:

  * Wrap `query.sql` thành CTE: `WITH raw AS (...)`
  * Sinh query mới:

```sql
SELECT
  group_col1, group_col2,
  AGG(metric1) AS metric1, AGG(metric2) AS metric2
FROM raw
GROUP BY group_col1, group_col2
```

→ AGG dựa vào định nghĩa aggregation trong `definition.ts`

### 4.2 Filter & Date Range

Hệ thống xử lý theo 2 cơ chế:

1.  **Date Range (Placeholder):** Các biến `@DS_START_DATE` và `@DS_END_DATE` trong `query.sql` gốc sẽ được thay thế trực tiếp bằng giá trị `startDate` và `endDate`. Điều này cho phép các logic tính toán phức tạp bên trong query gốc có thể sử dụng dải ngày.

2.  **Dynamic Filters (Wrapped Query):** Các điều kiện filter từ tham số `filter_by` sẽ được inject vào mệnh đề `WHERE` của câu query bọc bên ngoài.

Ví dụ: `GET ...&filter_by={"country_code":["VN"]}` sẽ sinh ra câu SQL cuối cùng có dạng:

```sql
SELECT ...
FROM (
  -- Nội dung của query.sql với date range đã được thay thế
) AS raw
WHERE raw.country_code IN ('VN') -- Filter động được áp dụng ở đây
GROUP BY ...
```

---

## 5. ⚡ Caching

* API được cache in-memory tại backend theo full URL gọi.
* Tự động hết hạn sau thời gian TTL mặc định (hoặc có thể config).

---

## 6. 📈 Tích Hợp Chart

Tại frontend:

```ts
useDatasourceQuery('BigQuery_AdjustCohortData', {
  startDate: '20250601',
  endDate: '20250701',
  group_by: ['channel'],
  filter_by: { country_code: ['VN'] },
  metrics: ['cost', 'REV_D30']
})
```

✅ Sắp tới, các trang phức tạp sẽ chuyển sang API riêng (`/api/reports/...`) để xử lý logic chart tại backend, giúc tối ưu hiệu năng.

---

## 7. 🧹 Mở Rộng Datasource

🔹 Để thêm datasource mới từ nguồn bất kỳ:

1. Tạo thư mục `data-sources/MySQL_YourData`
2. Thêm file `definition.ts` với `source: 'mysql'`
3. Viết `query.sql` truy vấn dữ liệu
4. Đảm bảo server backend đã hỗ trợ `runQueryBySource('mysql')`

---

## 8. 🚧 Định Hướng Nâng Cao

* Tự động sinh chart từ schema datasource
* Cho phép `defaultGroupBy`, `defaultMetrics` trong definition schema
* Xây dựng bộ lọc thông minh, nhận biết ngữ cảnh (Context-aware filters): các lựa chọn trong bộ lọc sẽ tự động được cập nhật dựa trên các bộ lọc khác đang được áp dụng.