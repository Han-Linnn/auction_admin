import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, InputNumber, Popconfirm, Button, message } from 'antd';
import { getFee, modifyFee } from '@/services/api';

const FeeList: React.FC<{}> = () => {
  const [chargeRate, setChargeRate] = useState<number>(0);

  const getFeeData = async () => {
    const response = await getFee({});
    if (response.code === 200) {
      const { data } = response;
      const temp = data?.charge_rate ? Number(data?.charge_rate) * 100 : 0;
      setChargeRate(temp);
    }
  };

  const modifyFeeData = async () => {
    const response = await modifyFee({ charge_rate: chargeRate / 100 });
    if (response.code === 200) {
      message.success('修改成功');
    }
  };

  useEffect(() => {
    getFeeData();
  }, []);

  return (
    <PageContainer>
      <Card>
        手续费 : &nbsp;
        <InputNumber
          style={{ width: '200px' }}
          min={0}
          max={100}
          step={1}
          value={chargeRate}
          precision={0}
          onChange={(value: number) => setChargeRate(value)}
        />
        %
        <Popconfirm
          title="确认修改手续费?"
          placement="topRight"
          onConfirm={() => {
            if (chargeRate > -1) {
              modifyFeeData();
            }
          }}
        >
          <Button type="primary" style={{ marginLeft: '30px' }}>
            确认修改
          </Button>
        </Popconfirm>
      </Card>
    </PageContainer>
  );
};
export default FeeList;
