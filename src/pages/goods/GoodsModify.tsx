import React, { useEffect, useState } from 'react';
import { history, useModel } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import { getGoodsData, createGoods, modifyGoods, deleteImage, getCategoryTree, getSpecificationTree, getAllEvent } from '@/services/api';
import { Form, Input, Button, Row, Col, Card, Select, InputNumber, Tree, Divider, message, Spin } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import GoodsImages from './components/GoodsImages';
import EventModal from './components/EventModal';
import BrandModal from './components/BrandModal';
import styles from './detail.less';

const { TreeNode } = Tree;

const GoodsModify: React.FC<{ props: any }> = (props) => {
  const {
    location: {
      query: { id },
    },
  } = props;
  const [goodsInfoForm] = Form.useForm();
  const [propertyForm] = Form.useForm();
  const [brandForm] = Form.useForm();
  const { cateData } = useModel('dataModel');
  const [spinning, setSpinning] = useState(false)
  const [detailData, setDetailData] = useState<any>(null) // 商品详情
  const [imagesList, setImagesList] = useState<any[]>([]); // 商品图片
  const [delImagesList, setDelImagesList] = useState<string[]>([]); // 被删除商品图片
  const [customData, setCustomData] = useState<any[]>([]); // 自定义数据

  const [selectCategory, setCategory] = useState(2) // 已选分类
  const [brandList, setBrandList] = useState<any[]>([]) // 分类树品牌数据
  const [selectBrand, setSelectBrand] = useState('') // 已选品牌
  const [specificationsTree, setSpecificationsTree] = useState<any[]>([]) // 分类树规格数据
  const [selectSpecifications, setSelectSpecifications] = useState<any[]>([]) // 已选规格属性
  const [eventList, setEventList] = useState<any[]>([]) // 活动列表数据

  const [eventVisible, setEventVisible] = useState(false)
  const [brandVisible, setBrandVisible] = useState(false)

  const getAllEventData = async () => {
    const response = await getAllEvent({});
    if (response.code === 200) {
      setEventList(response.data)
    }
  }

  // 初始化图片列表
  const initImagesList = (data: any) => {
    if (data && 'pic_small_url' in data && data.pic_small_url
      && 'pic_url' in data && data.pic_url) {
      const { pic_small_url } = data;
      const tempData = []
      pic_small_url.forEach((item: string, index: number) => {
        tempData.push({
          uid: index,
          url: data.pic_url[index],
          smallUrl: item
        })
      })
      setImagesList(tempData)
    }
  }

  // 初始化规格树数据, 以及已选节点
  // 接口数据定义不合理.害死人啊!!!苦.累.改不动改不动了
  const InitSpecificationsData = (data: any, attributesData: any) => {
    const tempData = []
    const tempSelect = []
    if (data && data.length > 0) {
      data.forEach((item: any) => {
        const tempChildren = []
        if ('attributes' in item && item.attributes) {
          const { attributes } = item
          attributes.forEach((subItem: any) => {
            tempChildren.push({
              key: subItem.key,
              id: subItem.id,
              title: subItem.name,
            })
          })
        }
        tempData.push({
          key: item.key,
          title: item.name,
          children: tempChildren
        })
      })

      // 已选节点
      if (attributesData && attributesData.length > 0) {
        attributesData.forEach((dataItem: any) => {
          tempData.forEach((treeItem: any) => {
            const { children } = treeItem
            children.forEach((childrenItem: any) => {
              if (childrenItem.id === dataItem.id) {
                tempSelect.push(childrenItem.key)
              }
            })
          })
        })
      }

    }
    setSpecificationsTree(tempData) // 树数据
    setSelectSpecifications(tempSelect) // 已选节点
  }

  // 获取分类品牌/规格树
  const getCategoryTreeData = async (cateId: number) => {
    const response = await getCategoryTree(cateId);
    if (response.code === 200) {
      const { data } = response
      // if ('specifications' in data) {
      //   InitSpecificationsData(data.specifications, attributesData)
      // }
      if ('brands' in data) {
        setBrandList(data.brands)
      }
    }
  }

  // 获取分类规格树
  const getSpecificationTreeData = async (cateId: number, attributesData: any) => {
    const response = await getSpecificationTree(cateId);
    if (response.code === 200) {
      InitSpecificationsData(response.data, attributesData)
    }
  }

  // 获取商品详情
  const getGoodsDetailData = async () => {
    setSpinning(true)
    const response = await getGoodsData({ goods_id: id });
    let tempData = null;
    if (response.code === 200) {
      const { data } = response

      setCategory(data.category_id)
      getCategoryTreeData(data.category_id)
      getSpecificationTreeData(data.category_id, data.attributes)

      tempData = data;
      goodsInfoForm.setFieldsValue({
        lot_number: data.lot_number,
        event_id: data.event_id,
        title: data.title,
        category_id: data.category_id,
        // is_sale: data.is_sale,
        start_price: data.start_price,
      })

      setSelectBrand(data.brand)

      brandForm.setFieldsValue({
        brand: data.brand,
        series: data.series,
      })

      initImagesList(data)
      if (data && 'property_json' in data) {
        propertyForm.setFieldsValue(data.property_json)
      }
      setSpinning(false)
    }
    setDetailData(tempData)
  };

  useEffect(() => {
    if (id) {
      getGoodsDetailData()
    } else {
      getCategoryTreeData(selectCategory)
      getSpecificationTreeData(selectCategory, null)
    }
    getAllEventData()
    return () => {
      goodsInfoForm.resetFields();
      brandForm.resetFields()
      propertyForm.resetFields()
    }
  }, []);

  const handleDeleteImage = async () => {
    await deleteImage({ pic_url: delImagesList });
  }

  const changeCustomDataLength = (isAdd: boolean) => {
    const tempData = [...customData]
    if (isAdd) {
      tempData.push({
        key: null,
        value: null,
      })
    } else {
      tempData.pop()
    }
    setCustomData(tempData)
  }

  const modifyCustomData = (index: number, key: string, value: string) => {
    const tempData = [...customData]
    tempData[index][key] = value
    setCustomData(tempData)
  }

  const splitImageUrl = (url: string) => {
    const tempUrl = url.split('/')
    if (tempUrl.length > 0) {
      tempUrl.splice(0, 3)
      return `/${tempUrl.join('/')}`
    }
    return url
  }

  const handleCreateGoods = async (params: API.GoodsData) => {
    const response = await createGoods(params);
    if (response.code === 201) {
      if (delImagesList.length > 0) {
        handleDeleteImage()
      }
      message.success('新增成功');
      history.goBack()
    }
  };

  const handleModifGoods = async (params: any) => {
    const response = await modifyGoods(params);
    if (response.code === 201) {
      if (delImagesList.length > 0) {
        handleDeleteImage()
      }
      message.success('编辑成功')
      history.push({
        pathname: '/goods/detail',
        query: { id },
      });
    }
  };

  const deletePropertyJsonItem = (key: string) => {
    const tempDetailData = { ...detailData }
    delete tempDetailData.property_json[key]
    setDetailData(tempDetailData)
  }

  const getBrandIdByName = (name: string) => {
    let temp = 0
    brandList.forEach((item: any) => {
      if (item.name === name) {
        temp = item.id
      }
    })
    return temp
  }

  const getSeriesIdByName = (name: string) => {
    let temp = 0
    brandList.forEach((item: any) => {
      if ('series' in item) {
        item.series.forEach((subItem: any) => {
          if (subItem.name === name) {
            temp = subItem.id
          }
        })
      }
    })
    return temp
  }

  // 转化已选规格树数据为修改接口规定格式(提交接口用)
  const arrangeSpecifications = () => {
    const temp = []
    const tempSelect = []
    selectSpecifications.forEach((item: any) => {
      if (item.indexOf('-') > 0) {
        tempSelect.push(item)
      }
    })

    if (tempSelect.length > 0 && specificationsTree.length > 0) {
      specificationsTree.forEach((item: any) => {
        if ('children' in item && item.children && item.children.length > 0) {
          item.children.forEach((subItem: any) => {
            tempSelect.forEach((selectKey: any) => {
              if (subItem.key === selectKey) {
                temp.push(subItem.id)
              }
            })
          })
        }
      })
    }
    return temp
  }

  // 控制规格树单选
  const radioCheckedKeys = (checkedKeys: React.Key[]) => {
    if (checkedKeys.length > 0) {
      if (selectSpecifications.length > 0) {
        let index = -1
        const temp = [...selectSpecifications]
        const tempDel = selectSpecifications.filter(key => !checkedKeys.includes(key))
        if (tempDel.length > 0) {
          // 删除已有
          temp.forEach((item: any, i: number) => {
            if (item === tempDel[0]) {
              index = i
            }
          })
          if (index >= 0) {
            temp.splice(index, 1)
            setSelectSpecifications(temp)
          } else {
            console.log('oh no! something went wrong')
          }
        } else {
          // 新增选择
          const key = checkedKeys[checkedKeys.length - 1] as string
          const parentKey = key.split('-')[0]
          temp.forEach((item: any, i: number) => {
            const selectKey = item.split('-')[0]
            if (parentKey === selectKey) {
              index = i
            }
          })
          if (index >= 0) {
            // 同一父节点单选
            temp.splice(index, 1, key)
            setSelectSpecifications(temp)
          } else {
            // 同父节点没有选择
            setSelectSpecifications(checkedKeys)
          }
        }
      } else {
        // 现有选择节点为空
        setSelectSpecifications(checkedKeys)
      }
    } else {
      // 无选择节点
      setSelectSpecifications([])
    }
  }

  const submitForm = async () => {
    const tempData: API.GoodsData = {}
    // 基本信息
    const fieldsValue = await goodsInfoForm.validateFields();
    tempData.lot_number = fieldsValue.lot_number
    tempData.event_id = fieldsValue.event_id
    tempData.title = fieldsValue.title || 'Custom Goods'
    tempData.category_id = fieldsValue.category_id || selectCategory
    tempData.is_sale = true // fieldsValue.is_sale
    tempData.start_price = fieldsValue.start_price
    tempData.source = 'Custom Goods'

    // 品牌
    const brandFieldsValue = await brandForm.validateFields();
    if (getBrandIdByName(brandFieldsValue.brand || selectBrand)) {
      tempData.brand_id = getBrandIdByName(brandFieldsValue.brand || selectBrand)
    }
    if (getSeriesIdByName(brandFieldsValue.series)) {
      tempData.series_id = getSeriesIdByName(brandFieldsValue.series)
    }

    // 规格属性
    tempData.attributes = selectSpecifications.length > 0 ?
      arrangeSpecifications() : []

    // 图片
    if (imagesList.length > 0) {
      const tempPicUrl: string[] = []
      const tempPicSmallUrl: string[] = []
      imagesList.forEach(item => {
        tempPicUrl.push(splitImageUrl(item.url))
        tempPicSmallUrl.push(splitImageUrl(item.smallUrl))
      })
      tempData.pic_url = tempPicUrl
      tempData.pic_small_url = tempPicSmallUrl
    }

    // 商品信息
    if (id) {
      const fieldsValue2 = await propertyForm.validateFields();
      tempData.property_json = fieldsValue2
    }
    if (customData.length > 0) {
      const tempJson = { ...tempData.property_json }
      customData.forEach(item => {
        tempJson[item.key] = item.value
      })
      tempData.property_json = tempJson
    }
    console.log('-submit-', tempData)

    if (id) {
      handleModifGoods({
        id,
        data: tempData
      })
    } else {
      handleCreateGoods(tempData)
    }
  };

  const renderEvent = () => {
    if (eventList && eventList.length > 0) {
      return eventList.map((item: any) => (
        <Select.Option key={item.id} value={item.id}>
          {item.name}
        </Select.Option>
      ));
    }
    return null
  }

  const renderCategory = () => {
    if (cateData) {
      return cateData.map((item: any) => (
        <Select.Option key={item.id} value={item.id}>
          {item.category_name}
        </Select.Option>
      ));
    }
    return null
  };

  const renderGoodsInfo = () => {
    return (
      <Form
        form={goodsInfoForm}
        name="goodsInfoForm"
      >
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item
              label="拍卖会编号"
              name="lot_number"
              rules={[
                {
                  required: true,
                  message: '请输入拍卖会编号',
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <div>
              <Form.Item
                label="所属活动"
                name="event_id"
                style={{ width: '90%', float: 'left' }}
                rules={[
                  {
                    required: true,
                    message: '请选择所属活动',
                  },
                ]}
              >
                <Select
                  showSearch
                  optionFilterProp="children"
                >
                  {renderEvent()}
                </Select>
              </Form.Item>
              <Button
                type="primary"
                shape="circle"
                style={{ width: '5%', float: 'right' }}
                icon={<PlusOutlined />}
                onClick={() => {
                  setEventVisible(true)
                }}
              />
            </div>
          </Col>
          <Col span={8}>
            <Form.Item
              label="商品名称"
              name="title"
            >
              <Input defaultValue='Custom Goods' />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item
              label="起拍价"
              name="start_price"
            >
              <InputNumber min={0} precision={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="分类"
              name="category_id"
            >
              <Select
                showSearch
                optionFilterProp="children"
                defaultValue={2}
                onChange={(value) => {
                  setCategory(value)
                  brandForm.setFieldsValue({ brand: null, series: null })
                  setSelectSpecifications([])
                  getCategoryTreeData(value as number)
                  getSpecificationTreeData(value, null)
                }}>
                {renderCategory()}
              </Select>
            </Form.Item>
          </Col>
          {/* <Col span={8}>
            <Form.Item
              label="上下架"
              name="is_sale"
            // rules={[
            //   {
            //     required: true,
            //     message: '请选择上下架',
            //   },
            // ]}
            >
              <Select>
                <Select.Option key='上架' value>
                  上架
                </Select.Option>
                <Select.Option key='下架' value={false}>
                  下架
                </Select.Option>
              </Select>
            </Form.Item>
          </Col> */}
        </Row>
      </Form>
    );
  };

  // 渲染品牌
  const renderSelsetBrand = () => {
    if (brandList && brandList.length > 0) {
      return brandList.map((item: any) => (
        <Select.Option key={item.id} value={item.name}>
          {item.name}
        </Select.Option>
      ))
    }
    return null
  }

  // 渲染品牌下系列
  const renderSelsetSeries = () => {
    if (brandList && brandList.length > 0 && selectBrand) {
      let tempSeries = []
      brandList.map((item: any) => {
        if (item.name === selectBrand) {
          tempSeries = item.series
        }
      })
      if (tempSeries.length > 0) {
        return tempSeries.map((item: any) => (
          <Select.Option key={item.id} value={item.name}>
            {item.name}
          </Select.Option>
        ))
      } return null
    }
    return null
  }

  // 渲染规格树
  const renderTreeNodes = (data: any) => {
    return data.map((item: any) => {
      if (item.children) {
        return (
          <TreeNode checkable={false} title={item.title} key={item.key}>
            {renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.key} {...item} />;
    });
  }

  const renderBrandInfo = () => {
    return (
      <div>
        <Card
          title='品牌'
          size="small"
          style={{ width: '48%', float: 'left' }}
        >
          <Form
            form={brandForm}
            name="brandForm"
          >
            <Row gutter={24}>
              <Col span={24}>
                <>
                  <Form.Item
                    label="品牌"
                    name="brand"
                    style={{ width: '90%', float: 'left' }}
                  >
                    <Select showSearch onChange={(value) => {
                      setSelectBrand(value)
                      brandForm.setFieldsValue({ series: null })
                    }}>
                      {renderSelsetBrand()}
                    </Select>
                  </Form.Item>
                  <Button
                    type="primary"
                    shape="circle"
                    style={{ width: '5%', float: 'right' }}
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setBrandVisible(true)
                    }}
                  />
                </>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item
                  label="系列"
                  name="series"
                >
                  <Select showSearch>
                    {renderSelsetSeries()}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
        <Card
          title='规格'
          size="small"
          style={{ width: '48%', float: 'right' }}
          extra={<a onClick={() => {
            setSelectSpecifications([])
          }}>清空</a>}
        >
          <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
            <Tree
              checkable
              checkedKeys={selectSpecifications}
              onCheck={(checkedKeys: React.Key[]) => {
                radioCheckedKeys(checkedKeys)
              }}
            >
              {renderTreeNodes(specificationsTree)}
            </Tree>
          </div>
        </Card>
      </div>
    )
  }

  const renderPropertyFormItem = () => {
    const { property_json } = detailData;
    if (property_json) {
      return (
        Object.keys(property_json).map((key: string) => (
          <Col span={8} key={key}>
            <>
              <Button
                type="primary"
                shape="circle"
                icon={<MinusOutlined />}
                style={{ width: '5%', float: 'left' }}
                onClick={() => {
                  deletePropertyJsonItem(key)
                }}
              />
              <Form.Item
                label={key}
                name={key}
                style={{ width: '90%', float: 'right' }}
              >
                <Input />
              </Form.Item>
            </>
          </Col>
        ))
      );
    }
    return null
  }

  const renderCustomDataFormItem = () => {
    return (
      customData.map((item: any, index: number) => (
        <Col span={8} key={index}>
          <div style={{ width: '100%', marginBottom: '1vw' }}>
            <Input
              style={{ width: '37%', float: 'left' }}
              name='key'
              defaultValue={item.key}
              placeholder='标题(英文)'
              onChange={(e) => {
                modifyCustomData(index, 'key', e.target.value)
              }}
            />
            &nbsp;:&nbsp;
            <Input
              style={{ width: '57%' }}
              name='value'
              defaultValue={item.value}
              placeholder='内容'
              onChange={(e) => {
                modifyCustomData(index, 'value', e.target.value)
              }}
            />
          </div>
        </Col>
      ))
    )
  }

  const renderPropertyData = () => {
    return (
      <>
        {customData.length > 0 && <>
          <Row gutter={24}>{renderCustomDataFormItem()}</Row>
          <Divider style={{ marginTop: 2 }} />
        </>}
        <Form
          form={propertyForm}
          name="propertyForm"
        >
          {(detailData && 'property_json' in detailData) &&
            <Row gutter={24}>{renderPropertyFormItem()}</Row>
          }
        </Form>
      </>
    )
  }

  return (
    <PageContainer title={`${id ? '编辑' : '新增'}商品`} className={styles.container}>
      <Spin spinning={spinning}>
        <>
          <Card title="基本信息" bodyStyle={{ padding: '10px 24px' }}>
            {renderGoodsInfo()}
          </Card>
          <Card title="品牌、规格信息" bodyStyle={{ padding: '10px 24px' }}>
            {renderBrandInfo()}
          </Card>
          <Card title="商品图片" bodyStyle={{ padding: 25 }}>
            <GoodsImages
              imagesList={imagesList}
              delImagesList={delImagesList}
              setImagesList={(data: any) => {
                setImagesList(data)
              }}
              setDelImagesList={(data: any) => {
                setDelImagesList(data)
              }}
            />
          </Card>
          <Card title="商品信息" bodyStyle={{ padding: '10px 24px' }} extra={
            <>
              <Button type="primary" shape="circle" icon={<PlusOutlined />} onClick={() => {
                changeCustomDataLength(true)
              }} />
              <Button disabled={customData.length === 0} type="primary" shape="circle" icon={<MinusOutlined />} style={{ marginLeft: '10px' }} onClick={() => {
                changeCustomDataLength(false)
              }} />
            </>
          }>
            {renderPropertyData()}
          </Card>
          <div style={{ width: '100%', textAlign: 'center' }}>
            <Button type="primary" onClick={() => {
              submitForm()
            }}>
              确认提交
          </Button>
          </div>
          <EventModal
            eventVisible={eventVisible}
            onCancel={() => setEventVisible(false)}
            onOk={(eid) => {
              getAllEventData()
              setCategory(eid)
              goodsInfoForm.setFieldsValue({
                event_id: eid,
              })
              setEventVisible(false)
            }
            }
          />
          <BrandModal
            cateId={selectCategory}
            brandVisible={brandVisible}
            onCancel={() => setBrandVisible(false)}
            onOk={(name) => {
              getCategoryTreeData(selectCategory)
              setSelectBrand(name)
              brandForm.setFieldsValue({
                brand: name,
              })
              setBrandVisible(false)
            }
            }
          />
        </>
      </Spin>
    </PageContainer>
  )
}

export default GoodsModify
