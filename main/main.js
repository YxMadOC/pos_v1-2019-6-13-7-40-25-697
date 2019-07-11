'use strict';

const allItems = loadAllItems();
const promotions = loadPromotions();

const title = "***<没钱赚商店>收据***";
const upDelimeter = "----------------------\n";
const downDelimeter = "**********************";

function scanBarcodes(barcodes) {
    return barcodes.reduce((prev, item) => {
        if (item.indexOf('-') >= 0) {
            if (item.split('-')[0] in prev) {
                prev[item.split('-')[0]] += parseFloat(item.split('-')[1]);
            } else {
                prev[item.split('-')[0]] = parseFloat(item.split('-')[1]);
            }
            return prev;
        }
        if (item in prev) {
            prev[item]++;
        } else {
            prev[item] = 1;
        }
        return prev;
    }, {});
}

function findRelatedGoods(scanResult) {
    let relatedGoods = [];
    allItems.forEach(item => {
        if (scanResult[item.barcode]) {
            let temp = item;
            temp.count = scanResult[item.barcode];
            relatedGoods.push(temp);
        }
    });
    return relatedGoods;
}

function checkPromotion(relatedGoods) {
    relatedGoods.forEach(item => {
        if(promotions[0].barcodes.includes(item.barcode)){
            let discountable = item.count >= 2;
            if (discountable) {
                item.discount = true;
            }
        }
    });
    return relatedGoods;
}

function createReceipt(relatedGoods) {
    let total = 0;
    let discountTotal = 0;
    relatedGoods = checkPromotion(relatedGoods);
    let receiptStr = title + '\n';
    relatedGoods.forEach(item => {
        let littleTotal = !item.discount ? item.price * item.count : item.price * item.count - item.price;
        receiptStr += `名称：${item.name}，数量：${item.count}${item.unit}，单价：${item.price.toFixed(2)}(元)，小计：${littleTotal.toFixed(2)}(元)\n`;
        total += item.price * item.count;
        discountTotal += littleTotal;
    });
    receiptStr += upDelimeter;
    receiptStr += `总计：${discountTotal.toFixed(2)}(元)\n`;
    receiptStr += `节省：${(total - discountTotal).toFixed(2)}(元)\n`;
    receiptStr += downDelimeter;
    return receiptStr;
}

function printReceipt(barcodes) {
    let scanResult = scanBarcodes(barcodes);
    let relatedGoods = findRelatedGoods(scanResult);
    console.log(createReceipt(relatedGoods));
}
