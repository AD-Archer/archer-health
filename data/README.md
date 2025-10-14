# USDA FoodData Central Database Seeding

This directory contains the USDA FoodData Central CSV files used to seed the Archer Health database with verified nutritional information.

## Setup Instructions

1. **Download USDA Data**: Extract the FoodData Central CSV files into this `data/` folder
2. **Run Seeding**: Use the automated seeding script:
   ```bash
   npx prisma db seed
   ```

## What Gets Seeded

The seeding process imports comprehensive nutritional data:

- **2+ million foods** with verified USDA data
- Complete nutrient profiles (proteins, carbs, fats, vitamins, minerals)
- Food categories and hierarchical organization
- Serving sizes and portion data
- All data sourced from USDA's official FoodData Central database

## Database Tables Created

The following tables are populated during seeding:

- `UsdaFoodCategory` - Food categories (dairy, meats, vegetables, etc.)
- `UsdaMeasureUnit` - Units of measurement (cups, grams, tablespoons, etc.)
- `UsdaNutrient` - Nutrient definitions (protein, carbs, vitamins, etc.)
- `UsdaFood` - Basic food information
- `UsdaFoodNutrient` - Nutritional values per food
- `UsdaFoodPortion` - Serving sizes and portions

## Updating USDA Data

When new USDA data is released (typically annually):

### Option 1: Replace Current Data
```bash
# 1. Download new CSV files from USDA FoodData Central
# 2. Replace contents of FoodData_Central_csv_2025-04-24/
# 3. Run seeding
npx prisma db seed
```

### Option 2: Create New Version
```bash
# 1. Create new folder for the year
mkdir FoodData_Central_csv_2026-04-24

# 2. Extract new CSV files into the new folder
# 3. Update prisma/seed.ts DATA_DIR path
# 4. Run seeding
npx prisma db seed
```

## Data Integrity

The seeding process is designed to be:
- **Non-destructive**: User-created foods remain untouched
- **Idempotent**: Can be run multiple times safely (uses `skipDuplicates`)
- **Transactional**: Large datasets are processed in batches
- **Modular**: USDA data is completely separate from user data

## Docker Integration

For Docker deployments, the seeding happens automatically:

```bash
# Using helper seeder container (recommended)
docker-compose --profile seed up seeder

# Or integrated seeding
docker-compose up app  # Includes automatic seeding
```

================================================================================
USDA FoodData Central - CSV File Headers Analysis
================================================================================

File: acquisition_samples.csv
--------------------------------------------------------------------------------
Columns (2):
   1. fdc_id_of_sample_food
   2. fdc_id_of_acquisition_food

Approximate rows: 7,999


File: agricultural_samples.csv
--------------------------------------------------------------------------------
Columns (5):
   1. fdc_id
   2. acquisition_date
   3. market_class
   4. treatment
   5. state

Approximate rows: 810


File: branded_food.csv
--------------------------------------------------------------------------------
Columns (21):
   1. fdc_id
   2. brand_owner
   3. brand_name
   4. subbrand_name
   5. gtin_upc
   6. ingredients
   7. not_a_significant_source_of
   8. serving_size
   9. serving_size_unit
  10. household_serving_fulltext
  11. branded_food_category
  12. data_source
  13. package_weight
  14. modified_date
  15. available_date
  16. market_country
  17. discontinued_date
  18. preparation_state_code
  19. trade_channel
  20. short_description
  21. material_code

Approximate rows: 1,977,398


File: fndds_derivation.csv
--------------------------------------------------------------------------------
Columns (2):
   1. derivation code
   2. derivation description

Approximate rows: 49


File: fndds_ingredient_nutrient_value.csv
--------------------------------------------------------------------------------
Columns (11):
   1. ingredient code
   2. Ingredient description
   3. Nutrient code
   4. Nutrient value
   5. Nutrient value source
   6. FDC ID
   7. Derivation code
   8. SR AddMod year
   9. Foundation year acquired
  10. Start date
  11. End date

Approximate rows: 275,535


File: food.csv
--------------------------------------------------------------------------------
Columns (5):
   1. fdc_id
   2. data_type
   3. description
   4. food_category_id
   5. publication_date

Approximate rows: 2,064,913


File: food_attribute.csv
--------------------------------------------------------------------------------
Columns (6):
   1. id
   2. fdc_id
   3. seq_num
   4. food_attribute_type_id
   5. name
   6. value

Approximate rows: 2,472,850


File: food_attribute_type.csv
--------------------------------------------------------------------------------
Columns (3):
   1. id
   2. name
   3. description

Approximate rows: 5


File: food_calorie_conversion_factor.csv
--------------------------------------------------------------------------------
Columns (4):
   1. food_nutrient_conversion_factor_id
   2. protein_value
   3. fat_value
   4. carbohydrate_value

Approximate rows: 5,076


File: food_category.csv
--------------------------------------------------------------------------------
Columns (3):
   1. id
   2. code
   3. description

Approximate rows: 28


File: food_component.csv
--------------------------------------------------------------------------------
Columns (8):
   1. id
   2. fdc_id
   3. name
   4. pct_weight
   5. is_refuse
   6. gram_weight
   7. data_points
   8. min_year_acquired

Approximate rows: 3,066


File: food_nutrient.csv
--------------------------------------------------------------------------------
Columns (13):
   1. id
   2. fdc_id
   3. nutrient_id
   4. amount
   5. data_points
   6. derivation_id
   7. min
   8. max
   9. median
  10. loq
  11. footnote
  12. min_year_acquired
  13. percent_daily_value

Approximate rows: 26,805,037


File: food_nutrient_conversion_factor.csv
--------------------------------------------------------------------------------
Columns (2):
   1. id
   2. fdc_id

Approximate rows: 706


File: food_nutrient_derivation.csv
--------------------------------------------------------------------------------
Columns (3):
   1. id
   2. code
   3. description

Approximate rows: 80


File: food_nutrient_source.csv
--------------------------------------------------------------------------------
Columns (3):
   1. id
   2. code
   3. description

Approximate rows: 10


File: food_portion.csv
--------------------------------------------------------------------------------
Columns (11):
   1. id
   2. fdc_id
   3. seq_num
   4. amount
   5. measure_unit_id
   6. portion_description
   7. modifier
   8. gram_weight
   9. data_points
  10. footnote
  11. min_year_acquired

Approximate rows: 47,173


File: food_protein_conversion_factor.csv
--------------------------------------------------------------------------------
Columns (2):
   1. food_nutrient_conversion_factor_id
   2. value

Approximate rows: 341


File: food_update_log_entry.csv
--------------------------------------------------------------------------------
Columns (3):
   1. id
   2. description
   3. last_updated

Approximate rows: 1,597,890


File: foundation_food.csv
--------------------------------------------------------------------------------
Columns (3):
   1. fdc_id
   2. NDB_number
   3. footnote

Approximate rows: 340


File: input_food.csv
--------------------------------------------------------------------------------
Columns (12):
   1. id
   2. fdc_id
   3. fdc_id_of_input_food
   4. seq_num
   5. amount
   6. sr_code
   7. sr_description
   8. unit
   9. portion_code
  10. portion_description
  11. gram_weight
  12. retention_code

Approximate rows: 18,584


File: lab_method.csv
--------------------------------------------------------------------------------
Columns (3):
   1. id
   2. description
   3. technique

Approximate rows: 284


File: lab_method_code.csv
--------------------------------------------------------------------------------
Columns (2):
   1. lab_method_id
   2. code

Approximate rows: 193


File: lab_method_nutrient.csv
--------------------------------------------------------------------------------
Columns (2):
   1. lab_method_id
   2. nutrient_id

Approximate rows: 568


File: market_acquisition.csv
--------------------------------------------------------------------------------
Columns (13):
   1. fdc_id
   2. brand_description
   3. expiration_date
   4. label_weight
   5. location
   6. acquisition_date
   7. sales_type
   8. sample_lot_nbr
   9. sell_by_date
  10. store_city
  11. store_name
  12. store_state
  13. upc_code

Approximate rows: 7,215


File: measure_unit.csv
--------------------------------------------------------------------------------
Columns (2):
   1. id
   2. name

Approximate rows: 122


File: microbe.csv
--------------------------------------------------------------------------------
Columns (7):
   1. id
   2. foodId
   3. method
   4. microbe_code
   5. min_value
   6. max_value
   7. uom

Approximate rows: 17


File: nutrient.csv
--------------------------------------------------------------------------------
Columns (5):
   1. id
   2. name
   3. unit_name
   4. nutrient_nbr
   5. rank

Approximate rows: 477


File: retention_factor.csv
--------------------------------------------------------------------------------
Columns (4):
   1. n.gid
   2. n.code
   3. n.foodGroupId
   4. n.description

Approximate rows: 270


File: sample_food.csv
--------------------------------------------------------------------------------
Columns (1):
   1. fdc_id

Approximate rows: 3,717


File: sr_legacy_food.csv
--------------------------------------------------------------------------------
Columns (2):
   1. fdc_id
   2. NDB_number

Approximate rows: 7,793


File: sub_sample_food.csv
--------------------------------------------------------------------------------
Columns (2):
   1. fdc_id
   2. fdc_id_of_sample_food

Approximate rows: 62,022


File: sub_sample_result.csv
--------------------------------------------------------------------------------
Columns (4):
   1. food_nutrient_id
   2. adjusted_amount
   3. lab_method_id
   4. nutrient_name

Approximate rows: 121,234


File: survey_fndds_food.csv
--------------------------------------------------------------------------------
Columns (5):
   1. fdc_id
   2. food_code
   3. wweia_category_code
   4. start_date
   5. end_date

Approximate rows: 5,432


File: wweia_food_category.csv
--------------------------------------------------------------------------------
Columns (2):
   1. wweia_food_category
   2. wweia_food_category_description

Approximate rows: 172


