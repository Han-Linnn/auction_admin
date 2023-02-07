import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { getBidRule, modifyBidRule } from '@/services/api';
import { Card, InputNumber, Button, message } from 'antd';
import styles from "./list.less"

const BidRuleList: React.FC<{}> = () => {
  const [bidRuleData, setBidRuleData] = useState<any>(null)

  const getBidRuleData = async () => {
    const response = await getBidRule({});
    if (response.code === 200) {
      setBidRuleData(response.data)
    }
  }

  const onModify = async () => {
    const response = await modifyBidRule(bidRuleData);
    if (response.code === 201) {
      message.success('修改成功')
    }
  }

  useEffect(() => {
    getBidRuleData()
  }, []);

  const renderPriceInput = (index: number, key: string, value: number) => {
    return (
      <InputNumber
        style={{ border: '0', width: '120px' }}
        defaultValue={value}
        min={100}
        precision={0}
        onChange={e => {
          const tempData = [...bidRuleData]
          tempData[index][key] = e
          setBidRuleData(tempData)
        }}
      />)
  };

  const renderBidRule = () => {
    return (
      bidRuleData.map((item: any, index: number) =>
        <tr key={`rule-td${index}`}>
          {/* <td>
            {renderPriceInput(index, 'low', item.low)}
            <span style={{ padding: 10 }}>~</span>
            {renderPriceInput(index, 'high', item.high)}
          </td> */}
          <td>{item.low} ~ {item.high || '∞'}</td>
          <td>{renderPriceInput(index, 'min_bid', item.min_bid)}</td>
          <td>{renderPriceInput(index, 'bid_unit', item.bid_unit)}</td>
        </tr>)
    )
  }

  return (
    <PageContainer>
      <Card>
        <table border="1" className={styles.ruleTable}>
          <thead>
            <tr>
              <th className={`${styles.theadTH} ${styles.thBig}`}>价格区间</th>
              <th className={`${styles.theadTH} ${styles.thSmall}`}>最低出价</th>
              <th className={`${styles.theadTH} ${styles.thSmall}`}>出价单位</th>
            </tr>
          </thead>
          <tbody>
            {bidRuleData && renderBidRule()}
          </tbody>
        </table>
        <div className={styles.footerDiv}>
          <Button type="primary" onClick={() => {
            onModify()
          }}>
            确认修改
          </Button>
        </div>
      </Card>
    </PageContainer>
  )
}

export default BidRuleList
