CREATE TABLE storeInventory
  (id SERIAL PRIMARY KEY NOT NULL,
   name VARCHAR(50),
   color VARCHAR(50),
   size VARCHAR(15),
   created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   img_url TEXT
 );
