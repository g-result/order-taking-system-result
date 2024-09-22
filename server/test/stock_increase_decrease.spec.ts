import { expect, test, describe } from 'bun:test'
import { calculateStockQuantity } from '../service/stock'

describe('calculateStockQuantity', () => {
  // WHOLE unitType のテスト
  describe('背と腹を分ける場合のWHOLE unitType', () => {
    test('全身が1個売れた場合', () => {
      const result = calculateStockQuantity({
        unitType: 'WHOLE',
        quantity: 1,
        separateBackBelly: true,
        initWholeVariantQuantity: 10,
        initHalfVariantQuantity: 20,
        initBackVariantQuantity: 20,
        initBellyVariantQuantity: 20
      })

      expect(result).toEqual({
        currentWholeVariantQuantity: 9,
        currentHalfVariantQuantity: 18,
        currentBackVariantQuantity: 18,
        currentBellyVariantQuantity: 18
      })
    })

    test('全身が複数個売れた場合', () => {
      const result = calculateStockQuantity({
        unitType: 'WHOLE',
        quantity: 3,
        separateBackBelly: true,
        initWholeVariantQuantity: 10,
        initHalfVariantQuantity: 20,
        initBackVariantQuantity: 20,
        initBellyVariantQuantity: 20
      })

      expect(result).toEqual({
        currentWholeVariantQuantity: 7,
        currentHalfVariantQuantity: 14,
        currentBackVariantQuantity: 14,
        currentBellyVariantQuantity: 14
      })
    })

    test('全身が1個追加された場合', () => {
      const result = calculateStockQuantity({
        unitType: 'WHOLE',
        quantity: -1,
        separateBackBelly: true,
        initWholeVariantQuantity: 10,
        initHalfVariantQuantity: 20,
        initBackVariantQuantity: 20,
        initBellyVariantQuantity: 20
      })

      expect(result).toEqual({
        currentWholeVariantQuantity: 11,
        currentHalfVariantQuantity: 22,
        currentBackVariantQuantity: 22,
        currentBellyVariantQuantity: 22
      })
    })

    test('全身が複数個追加された場合', () => {
      const result = calculateStockQuantity({
        unitType: 'WHOLE',
        quantity: -3,
        separateBackBelly: true,
        initWholeVariantQuantity: 10,
        initHalfVariantQuantity: 20,
        initBackVariantQuantity: 20,
        initBellyVariantQuantity: 20
      })

      expect(result).toEqual({
        currentWholeVariantQuantity: 13,
        currentHalfVariantQuantity: 26,
        currentBackVariantQuantity: 26,
        currentBellyVariantQuantity: 26
      })
    })

    test('全身の在庫がなくなる場合', () => {
      const result = calculateStockQuantity({
        unitType: 'WHOLE',
        quantity: 10,
        separateBackBelly: true,
        initWholeVariantQuantity: 10,
        initHalfVariantQuantity: 20,
        initBackVariantQuantity: 20,
        initBellyVariantQuantity: 20
      })

      expect(result).toEqual({
        currentWholeVariantQuantity: 0,
        currentHalfVariantQuantity: 0,
        currentBackVariantQuantity: 0,
        currentBellyVariantQuantity: 0
      })
    })
  })

  // HALF_BODY unitType のテスト
  describe('背と腹を分ける場合のHALF_BODY unitType', () => {
    test('半身が1個売れた場合（初期半身在庫が奇数）', () => {
      const result = calculateStockQuantity({
        unitType: 'HALF_BODY',
        quantity: 1,
        separateBackBelly: true,
        initWholeVariantQuantity: 10,
        initHalfVariantQuantity: 21,
        initBackVariantQuantity: 21,
        initBellyVariantQuantity: 21
      })

      expect(result).toEqual({
        currentWholeVariantQuantity: 10,
        currentHalfVariantQuantity: 20,
        currentBackVariantQuantity: 20,
        currentBellyVariantQuantity: 20
      })
    })

    test('半身が1個売れた場合（初期半身在庫が偶数）', () => {
      const result = calculateStockQuantity({
        unitType: 'HALF_BODY',
        quantity: 1,
        separateBackBelly: true,
        initWholeVariantQuantity: 10,
        initHalfVariantQuantity: 20,
        initBackVariantQuantity: 20,
        initBellyVariantQuantity: 20
      })

      expect(result).toEqual({
        currentWholeVariantQuantity: 9,
        currentHalfVariantQuantity: 19,
        currentBackVariantQuantity: 19,
        currentBellyVariantQuantity: 19
      })
    })

    test('半身が複数個売れた場合（初期半身在庫が奇数）', () => {
      const result = calculateStockQuantity({
        unitType: 'HALF_BODY',
        quantity: 4,
        separateBackBelly: true,
        initWholeVariantQuantity: 10,
        initHalfVariantQuantity: 21,
        initBackVariantQuantity: 21,
        initBellyVariantQuantity: 21
      })

      expect(result).toEqual({
        currentWholeVariantQuantity: 8,
        currentHalfVariantQuantity: 17,
        currentBackVariantQuantity: 17,
        currentBellyVariantQuantity: 17
      })
    })
    test('半身が複数個売れた場合（初期半身在庫が偶数）', () => {
      const result = calculateStockQuantity({
        unitType: 'HALF_BODY',
        quantity: 4,
        separateBackBelly: true,
        initWholeVariantQuantity: 10,
        initHalfVariantQuantity: 20,
        initBackVariantQuantity: 20,
        initBellyVariantQuantity: 20
      })

      expect(result).toEqual({
        currentWholeVariantQuantity: 8,
        currentHalfVariantQuantity: 16,
        currentBackVariantQuantity: 16,
        currentBellyVariantQuantity: 16
      })
    })

    test('半身が1個追加された場合（初期半身在庫が奇数）', () => {
      const result = calculateStockQuantity({
        unitType: 'HALF_BODY',
        quantity: -1,
        separateBackBelly: true,
        initWholeVariantQuantity: 10,
        initHalfVariantQuantity: 21,
        initBackVariantQuantity: 21,
        initBellyVariantQuantity: 21
      })

      expect(result).toEqual({
        currentWholeVariantQuantity: 11,
        currentHalfVariantQuantity: 22,
        currentBackVariantQuantity: 22,
        currentBellyVariantQuantity: 22
      })
    })

    test('半身が1個追加された場合（初期半身在庫が偶数）', () => {
      const result = calculateStockQuantity({
        unitType: 'HALF_BODY',
        quantity: -1,
        separateBackBelly: true,
        initWholeVariantQuantity: 10,
        initHalfVariantQuantity: 20,
        initBackVariantQuantity: 20,
        initBellyVariantQuantity: 20
      })

      expect(result).toEqual({
        currentWholeVariantQuantity: 10,
        currentHalfVariantQuantity: 21,
        currentBackVariantQuantity: 21,
        currentBellyVariantQuantity: 21
      })
    })

    test('半身が複数個売れた場合（初期半身在庫が奇数）', () => {
      const result = calculateStockQuantity({
        unitType: 'HALF_BODY',
        quantity: -4,
        separateBackBelly: true,
        initWholeVariantQuantity: 10,
        initHalfVariantQuantity: 21,
        initBackVariantQuantity: 21,
        initBellyVariantQuantity: 21
      })

      expect(result).toEqual({
        currentWholeVariantQuantity: 12,
        currentHalfVariantQuantity: 25,
        currentBackVariantQuantity: 25,
        currentBellyVariantQuantity: 25
      })
    })

    test('半身が複数個売れた場合（初期半身在庫が偶数）', () => {
      const result = calculateStockQuantity({
        unitType: 'HALF_BODY',
        quantity: -4,
        separateBackBelly: true,
        initWholeVariantQuantity: 10,
        initHalfVariantQuantity: 20,
        initBackVariantQuantity: 20,
        initBellyVariantQuantity: 20
      })

      expect(result).toEqual({
        currentWholeVariantQuantity: 12,
        currentHalfVariantQuantity: 24,
        currentBackVariantQuantity: 24,
        currentBellyVariantQuantity: 24
      })
    })

    test('半身の在庫がなくなる場合', () => {
      const result = calculateStockQuantity({
        unitType: 'HALF_BODY',
        quantity: 20,
        separateBackBelly: true,
        initWholeVariantQuantity: 10,
        initHalfVariantQuantity: 20,
        initBackVariantQuantity: 20,
        initBellyVariantQuantity: 20
      })

      expect(result).toEqual({
        currentWholeVariantQuantity: 0,
        currentHalfVariantQuantity: 0,
        currentBackVariantQuantity: 0,
        currentBellyVariantQuantity: 0
      })
    })
  })

  // QUATER_BACK unitType のテスト
  describe('背と腹を分ける場合のQUATER_BACK unitType', () => {
    test('1/4背が1個売れた場合', () => {
      const result = calculateStockQuantity({
        unitType: 'QUATER_BACK',
        quantity: 1,
        separateBackBelly: true,
        initWholeVariantQuantity: 10,
        initHalfVariantQuantity: 20,
        initBackVariantQuantity: 20,
        initBellyVariantQuantity: 20
      })

      expect(result).toEqual({
        currentWholeVariantQuantity: 9,
        currentHalfVariantQuantity: 19,
        currentBackVariantQuantity: 19,
        currentBellyVariantQuantity: 20
      })
    })

    test('1/4背が1個追加された場合', () => {
      const result = calculateStockQuantity({
        unitType: 'QUATER_BACK',
        quantity: -1,
        separateBackBelly: true,
        initWholeVariantQuantity: 10,
        initHalfVariantQuantity: 20,
        initBackVariantQuantity: 20,
        initBellyVariantQuantity: 20
      })

      expect(result).toEqual({
        currentWholeVariantQuantity: 10,
        currentHalfVariantQuantity: 20,
        currentBackVariantQuantity: 21,
        currentBellyVariantQuantity: 20
      })
    })

    test('1/4背が複数個売れた場合1', () => {
      const result = calculateStockQuantity({
        unitType: 'QUATER_BACK',
        quantity: 5,
        separateBackBelly: true,
        initWholeVariantQuantity: 10,
        initHalfVariantQuantity: 20,
        initBackVariantQuantity: 21,
        initBellyVariantQuantity: 20
      })

      expect(result).toEqual({
        currentWholeVariantQuantity: 8,
        currentHalfVariantQuantity: 16,
        currentBackVariantQuantity: 16,
        currentBellyVariantQuantity: 20
      })
    })

    test('1/4背が複数個追加された場合1', () => {
      const result = calculateStockQuantity({
        unitType: 'QUATER_BACK',
        quantity: -5,
        separateBackBelly: true,
        initWholeVariantQuantity: 10,
        initHalfVariantQuantity: 20,
        initBackVariantQuantity: 21,
        initBellyVariantQuantity: 20
      })

      expect(result).toEqual({
        currentWholeVariantQuantity: 10,
        currentHalfVariantQuantity: 20,
        currentBackVariantQuantity: 26,
        currentBellyVariantQuantity: 20
      })
    })

    test('1/4背が複数個売れた場合2', () => {
      const result = calculateStockQuantity({
        unitType: 'QUATER_BACK',
        quantity: 6,
        separateBackBelly: true,
        initWholeVariantQuantity: 10,
        initHalfVariantQuantity: 20,
        initBackVariantQuantity: 20,
        initBellyVariantQuantity: 20
      })

      expect(result).toEqual({
        currentWholeVariantQuantity: 7,
        currentHalfVariantQuantity: 14,
        currentBackVariantQuantity: 14,
        currentBellyVariantQuantity: 20
      })
    })

    test('1/4背が複数個追加された場合2', () => {
      const result = calculateStockQuantity({
        unitType: 'QUATER_BACK',
        quantity: -6,
        separateBackBelly: true,
        initWholeVariantQuantity: 10,
        initHalfVariantQuantity: 20,
        initBackVariantQuantity: 20,
        initBellyVariantQuantity: 26
      })

      expect(result).toEqual({
        currentWholeVariantQuantity: 13,
        currentHalfVariantQuantity: 26,
        currentBackVariantQuantity: 26,
        currentBellyVariantQuantity: 26
      })
    })

    test('1/4背が複数個売れた場合3', () => {
      const result = calculateStockQuantity({
        unitType: 'QUATER_BACK',
        quantity: 7,
        separateBackBelly: true,
        initWholeVariantQuantity: 10,
        initHalfVariantQuantity: 20,
        initBackVariantQuantity: 23,
        initBellyVariantQuantity: 20
      })

      expect(result).toEqual({
        currentWholeVariantQuantity: 8,
        currentHalfVariantQuantity: 16,
        currentBackVariantQuantity: 16,
        currentBellyVariantQuantity: 20
      })
    })

    test('1/4背が複数個追加された場合3', () => {
      const result = calculateStockQuantity({
        unitType: 'QUATER_BACK',
        quantity: -7,
        separateBackBelly: true,
        initWholeVariantQuantity: 10,
        initHalfVariantQuantity: 20,
        initBackVariantQuantity: 23,
        initBellyVariantQuantity: 20
      })

      expect(result).toEqual({
        currentWholeVariantQuantity: 10,
        currentHalfVariantQuantity: 20,
        currentBackVariantQuantity: 30,
        currentBellyVariantQuantity: 20
      })
    })

    test('1/4背が0になる場合', () => {
      const result = calculateStockQuantity({
        unitType: 'QUATER_BACK',
        quantity: 20,
        separateBackBelly: true,
        initWholeVariantQuantity: 10,
        initHalfVariantQuantity: 20,
        initBackVariantQuantity: 20,
        initBellyVariantQuantity: 20
      })

      expect(result).toEqual({
        currentWholeVariantQuantity: 0,
        currentHalfVariantQuantity: 0,
        currentBackVariantQuantity: 0,
        currentBellyVariantQuantity: 20
      })
    })
  })

  // QUATER_BELLY unitType のテスト
  // TODO: 郷原　追加されたテストケースを実装してください
  describe('QUATER_BELLY unitType', () => {
    test('1/4腹が1個売れた場合', () => {
      const result = calculateStockQuantity({
        unitType: 'QUATER_BELLY',
        quantity: 1,
        separateBackBelly: true,
        initWholeVariantQuantity: 10,
        initHalfVariantQuantity: 20,
        initBackVariantQuantity: 20,
        initBellyVariantQuantity: 20
      })

      expect(result).toEqual({
        currentWholeVariantQuantity: 9,
        currentHalfVariantQuantity: 19,
        currentBackVariantQuantity: 20,
        currentBellyVariantQuantity: 19
      })
    })

    test('1/4腹が複数個売れた場合1', () => {
      const result = calculateStockQuantity({
        unitType: 'QUATER_BELLY',
        quantity: 5,
        separateBackBelly: true,
        initWholeVariantQuantity: 10,
        initHalfVariantQuantity: 20,
        initBackVariantQuantity: 20,
        initBellyVariantQuantity: 21
      })

      expect(result).toEqual({
        currentWholeVariantQuantity: 8,
        currentHalfVariantQuantity: 16,
        currentBackVariantQuantity: 20,
        currentBellyVariantQuantity: 16
      })
    })

    test('1/4腹が複数個売れた場合2', () => {
      const result = calculateStockQuantity({
        unitType: 'QUATER_BELLY',
        quantity: 6,
        separateBackBelly: true,
        initWholeVariantQuantity: 10,
        initHalfVariantQuantity: 20,
        initBackVariantQuantity: 20,
        initBellyVariantQuantity: 22
      })

      expect(result).toEqual({
        currentWholeVariantQuantity: 8,
        currentHalfVariantQuantity: 16,
        currentBackVariantQuantity: 20,
        currentBellyVariantQuantity: 16
      })
    })

    test('1/4腹が複数個売れた場合3', () => {
      const result = calculateStockQuantity({
        unitType: 'QUATER_BELLY',
        quantity: 7,
        separateBackBelly: true,
        initWholeVariantQuantity: 10,
        initHalfVariantQuantity: 20,
        initBackVariantQuantity: 20,
        initBellyVariantQuantity: 23
      })

      expect(result).toEqual({
        currentWholeVariantQuantity: 8,
        currentHalfVariantQuantity: 16,
        currentBackVariantQuantity: 20,
        currentBellyVariantQuantity: 16
      })
    })
  })

  describe('背と腹を分けない場合', () => {
    test('全体が複数個売れた場合', () => {
      const result = calculateStockQuantity({
        unitType: 'WHOLE',
        quantity: 7,
        separateBackBelly: false,
        initWholeVariantQuantity: 10,
        initHalfVariantQuantity: 20,
        initBackVariantQuantity: 40
      })

      expect(result).toEqual({
        currentWholeVariantQuantity: 3,
        currentHalfVariantQuantity: 6,
        currentBackVariantQuantity: 12
      })
    })

    test('全体が複数個追加された場合', () => {
      const result = calculateStockQuantity({
        unitType: 'WHOLE',
        quantity: -7,
        separateBackBelly: false,
        initWholeVariantQuantity: 10,
        initHalfVariantQuantity: 20,
        initBackVariantQuantity: 40
      })

      expect(result).toEqual({
        currentWholeVariantQuantity: 17,
        currentHalfVariantQuantity: 34,
        currentBackVariantQuantity: 68
      })
    })

    test('半身が複数個売れた場合', () => {
      const result = calculateStockQuantity({
        unitType: 'HALF_BODY',
        quantity: 7,
        separateBackBelly: false,
        initWholeVariantQuantity: 10,
        initHalfVariantQuantity: 20,
        initBackVariantQuantity: 40
      })

      expect(result).toEqual({
        currentWholeVariantQuantity: 6,
        currentHalfVariantQuantity: 13,
        currentBackVariantQuantity: 26
      })
    })

    test('半身が複数個追加された場合', () => {
      const result = calculateStockQuantity({
        unitType: 'HALF_BODY',
        quantity: -7,
        separateBackBelly: false,
        initWholeVariantQuantity: 10,
        initHalfVariantQuantity: 20,
        initBackVariantQuantity: 40
      })

      expect(result).toEqual({
        currentWholeVariantQuantity: 13,
        currentHalfVariantQuantity: 27,
        currentBackVariantQuantity: 54
      })
    })

    test('1/4が複数個売れた場合', () => {
      const result = calculateStockQuantity({
        unitType: 'QUATER_BACK',
        quantity: 7,
        separateBackBelly: false,
        initWholeVariantQuantity: 10,
        initHalfVariantQuantity: 20,
        initBackVariantQuantity: 40
      })

      expect(result).toEqual({
        currentWholeVariantQuantity: 8,
        currentHalfVariantQuantity: 16,
        currentBackVariantQuantity: 33
      })
    })
    test('1/4が複数個追加された場合', () => {
      const result = calculateStockQuantity({
        unitType: 'QUATER_BACK',
        quantity: -7,
        separateBackBelly: false,
        initWholeVariantQuantity: 10,
        initHalfVariantQuantity: 20,
        initBackVariantQuantity: 40
      })

      expect(result).toEqual({
        currentWholeVariantQuantity: 11,
        currentHalfVariantQuantity: 23,
        currentBackVariantQuantity: 47
      })
    })
  })
})
