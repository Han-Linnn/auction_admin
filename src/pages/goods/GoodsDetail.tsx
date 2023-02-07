import React, { useEffect, useState } from 'react';
import { history, useModel } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Carousel, Button, Descriptions, Image, Spin } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { getGoodsData } from '@/services/api';
import { imageFallback } from '@/utils/constants';
import styles from './detail.less';

const GoodsDetail: React.FC<{ props: any }> = (props) => {
  const {
    location: {
      query: { id },
    },
  } = props;
  const { cateData } = useModel('dataModel');
  const [detailData, setDetailData] = useState<any>(null);

  const getGoodsDetailData = async () => {
    const response = await getGoodsData({ goods_id: id });
    let tempData = null;
    if (response.code === 200) {
      tempData = response.data;
      document.getElementsByTagName('title')[0].innerText = response.data?.title;
    }
    setDetailData(tempData);
  };

  useEffect(() => {
    getGoodsDetailData();
  }, []);

  const getCategoryName = (categoryId: number) => {
    let tempName = '-';
    if (cateData) {
      cateData.forEach((item: any) => {
        if (item.id === categoryId) {
          tempName = item.category_name;
        }
      });
    }
    return tempName;
  };

  const renderBaseInfo = () => {
    if (detailData) {
      return (
        <Descriptions title={null} column={4}>
          <Descriptions.Item label="商品名称">{detailData.title || '-'}</Descriptions.Item>
          <Descriptions.Item label="分类">
            {getCategoryName(detailData.category_id)}
          </Descriptions.Item>
          <Descriptions.Item label="来源">{detailData.source || '-'}</Descriptions.Item>
          <Descriptions.Item label="上下架">
            {detailData.is_sale ? '上架' : '下架'}
          </Descriptions.Item>
          {/* <Descriptions.Item label="开拍时间">{detailData.start_time || '-'}</Descriptions.Item> */}
          <Descriptions.Item label="起拍价(JPY)">{detailData.start_price || '-'}</Descriptions.Item>
          {/* <Descriptions.Item label="截至拍卖时间">{detailData.end_time || '-'}</Descriptions.Item> */}
          <Descriptions.Item label="最后价格(JPY)">
            {detailData.last_price || '-'}
          </Descriptions.Item>
        </Descriptions>
      );
    }
    return null;
  };

  const renderAttributes = (data: any) => {
    const temp = [];
    data.forEach((item: any) => {
      temp.push(item.name);
    });
    return temp.join(', ');
  };

  const renderBrandInfo = () => {
    if (detailData) {
      return (
        <Descriptions title={null} column={4}>
          <Descriptions.Item label="品牌">{detailData.brand}</Descriptions.Item>
          <Descriptions.Item label="系列">{detailData.series}</Descriptions.Item>
          <Descriptions.Item label="规格属性">
            {renderAttributes(detailData.attributes)}
          </Descriptions.Item>
        </Descriptions>
      );
    }
    return null;
  };

  const renderCarousel = () => {
    if (
      detailData &&
      'pic_url' in detailData &&
      detailData.pic_url &&
      detailData.pic_url.length > 0
    ) {
      const SampleNextArrow = (_props: any) => {
        const { className, style, onClick } = _props;
        return (
          <div
            className={className}
            style={{
              ...style,
              color: 'black',
              fontSize: '25px',
              lineHeight: '1.5715',
            }}
            onClick={onClick}
          >
            <RightOutlined />
          </div>
        );
      };

      const SamplePrevArrow = (_props: any) => {
        const { className, style, onClick } = _props;
        return (
          <div
            className={className}
            style={{
              ...style,
              color: 'black',
              fontSize: '25px',
              lineHeight: '1.5715',
            }}
            onClick={onClick}
          >
            <LeftOutlined />
          </div>
        );
      };

      const settings = {
        nextArrow: <SampleNextArrow />,
        prevArrow: <SamplePrevArrow />,
      };

      const { pic_url } = detailData;

      return (
        <Carousel arrows {...settings} style={{ width: '95%', margin: '0 auto' }}>
          {pic_url.map((item: any, index: number) => (
            <div key={`image_${index}`} style={{ display: 'grid', placeItems: 'center' }}>
              <Image
                style={{ width: '70%', margin: '0 auto' }}
                src={item}
                fallback={imageFallback}
                placeholder={
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <Spin size="large" />
                  </div>
                }
              />
            </div>
          ))}
        </Carousel>
      );
    }
    return null;
  };

  const renderGoodsInfo = () => {
    if (detailData && 'property_json' in detailData && detailData.property_json) {
      const { property_json } = detailData;
      return (
        <Descriptions title={null} column={4}>
          {Object.keys(property_json).map((key) => (
            <Descriptions.Item key={key} label={key}>
              {property_json[key] || '-'}
            </Descriptions.Item>
          ))}
        </Descriptions>
      );
    }
    return null;
  };

  return (
    <PageContainer
      title={`${detailData ? detailData.title : ''} - 商品详情`}
      className={styles.container}
    >
      <Card title="基本信息" bodyStyle={{ padding: '10px 24px' }}>
        {renderBaseInfo()}
      </Card>
      <Card title="品牌、规格信息" bodyStyle={{ padding: '10px 24px' }}>
        {renderBrandInfo()}
      </Card>
      <Card title="商品图片" bodyStyle={{ padding: 5 }}>
        {renderCarousel()}
      </Card>
      <Card title="商品信息" bodyStyle={{ padding: '10px 24px' }}>
        {renderGoodsInfo()}
      </Card>
      {detailData && (
        <div style={{ width: '100%', textAlign: 'center' }}>
          <Button
            type="primary"
            onClick={() => {
              history.push({
                pathname: '/goods/modify',
                query: { id: detailData.id },
              });
            }}
          >
            编辑
          </Button>
        </div>
      )}
    </PageContainer>
  );
};

export default GoodsDetail;
