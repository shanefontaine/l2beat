/*
                      ====== IMPORTANT NOTICE ======

DO NOT EDIT OR RENAME THIS FILE

This is a migration file. Once created the file should not be renamed or edited,
because migrations are only run once on the production server. 

If you find that something was incorrectly set up in the `up` function you
should create a new migration file that fixes the issue.

*/

import { Knex } from 'knex'

import * as oldView from './038_transactions_zksync_view_with_block_tip'
import * as oldIndex from './039_transactions_views_unique_indexes'

export async function up(knex: Knex) {
  await oldIndex.down(knex)

  await knex.schema.raw('DROP MATERIALIZED VIEW transactions.zksync_count_view')
  await knex.schema.raw('DROP MATERIALIZED VIEW transactions.block_count_view')

  await knex.schema.raw(
    'ALTER TABLE transactions.zksync ALTER COLUMN unix_timestamp TYPE timestamp',
  )
  await knex.schema.raw(
    'ALTER TABLE transactions.block ALTER COLUMN unix_timestamp TYPE timestamp',
  )
  await knex.schema.raw(
    'ALTER TABLE events ALTER COLUMN unix_timestamp TYPE timestamp',
  )

  await knex.schema.raw(
    `
    CREATE MATERIALIZED VIEW transactions.zksync_count_view AS
      SELECT
        date_trunc('day', zksync.unix_timestamp, 'UTC') unix_timestamp,
        count(*) count
      FROM transactions.zksync zksync
      INNER JOIN transactions.block_tip tip ON tip.project_id = 'zksync'
      WHERE zksync.unix_timestamp < date_trunc('day', tip.unix_timestamp, 'UTC')
      GROUP BY date_trunc('day', zksync.unix_timestamp, 'UTC')
  `,
  )
  await knex.schema.raw(`
  CREATE MATERIALIZED VIEW transactions.block_count_view AS
    SELECT
      block.project_id,
      date_trunc('day', block.unix_timestamp, 'UTC') unix_timestamp,
      sum(block.count) count
    FROM transactions.block block
    INNER JOIN transactions.block_tip tip ON block.project_id = tip.project_id
    WHERE block.unix_timestamp < date_trunc('day', tip.unix_timestamp, 'UTC')
    GROUP BY block.project_id, date_trunc('day', block.unix_timestamp, 'UTC')
  `)

  await oldIndex.up(knex)
}

export async function down(knex: Knex) {
  await oldIndex.down(knex)
  await oldView.up(knex)
  await oldIndex.up(knex)
}
