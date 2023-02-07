import React, { useEffect, useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import type { ActionType } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import {
  Popconfirm,
  Button,
  Form,
  Modal,
  Input,
  message,
  Spin,
  Image,
  Upload,
  Select,
  Popover,
  InputNumber,
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, FormOutlined } from '@ant-design/icons';
import { getUserList, createUser, modifyUserInfo, deleteUser, getRole } from '@/services/api';
import { apiURL, imageFallback, uploadURL } from '@/utils/constants';
import { localGet } from '@/utils/store';

const handleModify = async (params: {
  id: number;
  username: string;
  email: string;
  password: string;
  extend: string;
  avatar: string;
}) => {
  try {
    const response = await modifyUserInfo(params);
    if (response.code === 201) {
      message.success('编辑成功');
      return true;
    }
    return false;
  } catch (error) {
    message.error('编辑失败请重试');
    return false;
  }
};

const handleCreate = async (params: {
  auth: number;
  username: string;
  avatar: string;
  email: string;
  password: string;
  extend: string;
}) => {
  try {
    const response = await createUser(params);
    if (response.code === 201) {
      message.success('新增成功');
      return true;
    }
    return false;
  } catch (error) {
    message.error('新增失败请重试');
    return false;
  }
};

const handleDelete = async (id: number) => {
  try {
    const response = await deleteUser(id);
    if (response.code === 202) {
      message.success('删除成功');
      return true;
    }
    return false;
  } catch (error) {
    message.error('删除失败请重试');
    return false;
  }
};

const UserList: React.FC<{}> = () => {
  const actionRef = useRef<ActionType>();
  const [form] = Form.useForm();
  const [visibleType, setVisibleType] = useState<string>('');
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [activekey, setActiveKey] = useState<number>(2);
  const [imagesList, setImagesList] = useState<any[]>([]);
  const [delImagesList, setDelImagesList] = useState<string[]>([]);
  const [roleList, setRoleList] = useState([]);
  // 随机生成
  const [randomVisible, setRandomVisible] = useState<boolean>(false);
  const [randomNum, setRandomNum] = useState<number>(1);

  const randomUser = async (event: any) => {
    event.preventDefault();
    event.stopPropagation();
    fetch(`${apiURL}/user/random`, {
      method: 'POST',
      credentials: 'include',
      headers: new Headers({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localGet('auctionAdminToken')}`,
      }),
      body: JSON.stringify({ num: randomNum }),
    })
      .then((response) => {
        response.blob().then((blob) => {
          const blobUrl = window.URL.createObjectURL(blob);
          const filename = 'randomUser.xlsx';
          const aElement = document.createElement('a');
          document.body.appendChild(aElement);
          aElement.style.display = 'none';
          aElement.href = blobUrl;
          aElement.download = filename;
          aElement.click();
          window.URL.revokeObjectURL(blobUrl);
          document.body.removeChild(aElement);
        });
        if (actionRef.current) {
          actionRef.current.reload();
        }
      })
      .catch((error) => {
        message.warning('生成失败');
        console.log('生成失败', error);
      });
  };

  const getRoleData = async () => {
    const response = await getRole({ page: 1, size: 99 });
    if (response.code === 200) {
      if ('data' in response) {
        if ('items' in response.data) {
          setRoleList(response.data.items);
        }
      }
    }
  };

  const getRoleName = (id: number) => {
    let temp = '-';
    if (roleList && roleList.length > 0) {
      roleList.forEach((item: any) => {
        if (item.id === id) {
          temp = item.name;
        }
      });
    }
    return temp;
  };

  useEffect(() => {
    getRoleData();
  }, []);

  const onDelete = async (id: number) => {
    const success = await handleDelete(id);
    if (success) {
      if (actionRef.current) {
        actionRef.current.reload();
      }
    }
  };

  const onCancel = () => {
    form.resetFields();
    setImagesList([]);
    setCurrentItem(null);
    setVisibleType('');
  };

  const uploadChange = (info: any) => {
    setImagesList(info.fileList);
    if (info.file.status === 'done') {
      const { response } = info.file;
      if (response.code === 200) {
        if ('data' in response) {
          const { data } = response;
          // const temp = [...imagesList];
          const temp = [];
          temp.push({
            uid: imagesList.length,
            url: 'pic_small_url' in data ? data.pic_small_url[0] : '',
          });
          setImagesList(temp);
        }
      }
    }
  };

  const splitImageUrl = (url: string) => {
    const tempUrl = url.split('/');
    if (tempUrl.length > 0) {
      tempUrl.splice(0, 3);
      return `/${tempUrl.join('/')}`;
    }
    return url;
  };

  const uploadAvatar = () => {
    if (imagesList.length > 0) {
      const tempAvatar: string[] = [];
      imagesList.forEach((item) => {
        tempAvatar.push(splitImageUrl(item.url));
      });
      return tempAvatar[0].toString();
    }
    return '';
  };

  const submitForm = async () => {
    const fieldsValue = await form.validateFields();
    if (activekey) {
      const params = {
        username: fieldsValue.username,
        auth: activekey,
        email: fieldsValue.email,
        role_id: fieldsValue.role_id,
        extend: fieldsValue.extend,
        avatar: uploadAvatar(),
      };
      if (visibleType === 'modify') {
        params.id = currentItem.id;
      }
      if (visibleType === 'create') {
        params.password = fieldsValue.password;
      }
      if (visibleType === 'changePsw') {
        params.id = currentItem.id;
        params.password = fieldsValue.password;
      }

      const success =
        visibleType === 'create' ? await handleCreate(params) : await handleModify(params);
      if (success) {
        if (actionRef.current) {
          onCancel();
          actionRef.current.reload();
        }
      }
    }
  };

  const renderImage = (id: number, data: any) => {
    if (data && data.length > 0) {
      return (
        <Image
          width={50}
          height={50}
          src={data}
          preview={false}
          fallback={imageFallback}
          placeholder={<Spin />}
        />
      );
    }
    return <img src={imageFallback} alt="img" style={{ width: 50, height: 50 }} />;
  };

  const columns = [
    {
      title: '头像',
      dataIndex: 'avatar',
      render: (_, record: any) => renderImage(record.id, record.avatar),
    },
    {
      title: '用户名',
      dataIndex: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
    },
    {
      title: '角色',
      key: 'role',
      render: (_, record: any) => getRoleName(record.role_id),
    },
    {
      title: '备注',
      dataIndex: 'extend',
    },
    {
      title: '上次修改时间(JST)',
      dataIndex: 'update_time',
    },
    {
      title: '操作',
      valueType: 'option',
      width: 210,
      render: (_, record: any) => [
        <a
          key="editPsw"
          onClick={() => {
            form.setFieldsValue(record);
            setCurrentItem(record);
            setVisibleType('changePsw');
          }}
        >
          <FormOutlined /> 修改密码
        </a>,
        <a
          key="editable"
          onClick={() => {
            form.setFieldsValue(record);
            setCurrentItem(record);
            setVisibleType('modify');
          }}
        >
          <EditOutlined /> 编辑
        </a>,
        <Popconfirm
          key="delete"
          title="确认删除?"
          placement="topRight"
          onConfirm={() => {
            onDelete(record.id);
          }}
        >
          <a>
            <DeleteOutlined />
            删除
          </a>
        </Popconfirm>,
      ],
    },
  ];

  const renderRoleSelect = () => {
    if (roleList && roleList.length > 0) {
      return roleList.map((item: any) => (
        <Select.Option key={item.id} value={item.id}>
          {item.name}
        </Select.Option>
      ));
    }
    return null;
  };

  const renderModal = () => {
    const layout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    const uploadButton = (
      <div style={{ width: '100px', height: '100px', display: 'grid', placeItems: 'center' }}>
        <PlusOutlined />
        上传头像
      </div>
    );

    return (
      <Modal
        // eslint-disable-next-line
        title={`${
          visibleType === 'modify' ? '编辑' : visibleType === 'create' ? '新增' : '修改密码'
        }${visibleType === 'changePsw' ? '' : activekey === 2 ? '管理员' : '用户'}`}
        visible={visibleType !== ''}
        destroyOnClose
        onCancel={() => {
          onCancel();
        }}
        onOk={() => {
          submitForm();
        }}
      >
        <Form {...layout} form={form}>
          {visibleType !== 'changePsw' && (
            <Form.Item
              label="用户名"
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input />
            </Form.Item>
          )}
          {visibleType !== 'changePsw' && (
            <Form.Item
              label="邮箱"
              name="email"
              rules={[{ required: true, message: '请输入邮箱' }]}
            >
              <Input />
            </Form.Item>
          )}
          {visibleType !== 'modify' && (
            <Form.Item
              label="密码"
              name="password"
              rules={[{ required: visibleType !== 'modify', message: '请输入密码' }]}
            >
              <Input />
            </Form.Item>
          )}
          {visibleType !== 'changePsw' && (
            <Form.Item
              label="角色"
              name="role_id"
              rules={[{ required: visibleType === 'create', message: '请选择用户角色' }]}
            >
              <Select>{renderRoleSelect()}</Select>
            </Form.Item>
          )}
          {visibleType !== 'changePsw' && (
            <Form.Item label="备注" name="extend">
              <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
            </Form.Item>
          )}
          {visibleType !== 'changePsw' && (
            <Form.Item label="头像" name="avatar">
              <Upload
                accept=".png, .jpg, .jpeg"
                action={uploadURL}
                listType="picture-card"
                fileList={imagesList}
                onChange={uploadChange}
                headers={{
                  authorization: `Bearer ${localGet('auctionAdminToken')}`,
                }}
                data={{
                  module_name: 'user',
                }}
                onPreview={(file) => {
                  window.open(file.url, '_blank');
                }}
                onRemove={(file) => {
                  const temp = [...imagesList];
                  temp.splice(file.uid, 1);
                  setImagesList(temp);
                  const tempDel = [...delImagesList];
                  tempDel.push(file.url);
                  setDelImagesList(tempDel);
                }}
              >
                {imagesList.length >= 1 ? null : uploadButton}
              </Upload>
            </Form.Item>
          )}
        </Form>
      </Modal>
    );
  };

  return (
    <PageContainer>
      {activekey && (
        <>
          <ProTable
            actionRef={actionRef}
            rowKey="key"
            columns={columns}
            search={false}
            request={async (params) => {
              const { current, pageSize } = params;
              const res = await getUserList({
                page: current,
                size: pageSize,
                auth: activekey,
              });
              const { code } = res;
              if (code === 200) {
                const {
                  data: { items, total },
                } = res;
                const tempItems = items.map((item: any) => {
                  const { id } = item;
                  const key = id;
                  return {
                    ...item,
                    key,
                  };
                });
                return {
                  data: tempItems,
                  total,
                  success: true,
                };
              }
              return {
                data: [],
                success: false,
                total: 0,
              };
            }}
            toolbar={{
              menu: {
                type: 'tab',
                activeKey: activekey === 2 ? 'admin' : 'user',
                items: [
                  {
                    key: 'admin',
                    tab: '管理员',
                  },
                  {
                    key: 'user',
                    tab: '用户',
                  },
                ],
                onChange: (key) => {
                  setActiveKey(key === 'admin' ? 2 : 1);
                  if (actionRef.current) {
                    actionRef.current.reload();
                  }
                },
              },
              actions: [
                <Popover
                  content={
                    <>
                      <InputNumber
                        style={{ width: '150px' }}
                        min={1}
                        step={1}
                        precision={0}
                        value={randomNum}
                        onChange={(value: number) => {
                          setRandomNum(value);
                        }}
                      />
                      <Button
                        style={{ marginLeft: '20px' }}
                        type="primary"
                        onClick={(event: any) => {
                          if (randomNum > 0) {
                            randomUser(event);
                          } else {
                            message.warning('请输入生成用户数量');
                          }
                        }}
                      >
                        确认生成
                      </Button>
                    </>
                  }
                  title="请输入生成用户数量: "
                  trigger="click"
                  placement="topRight"
                  visible={randomVisible}
                  onVisibleChange={(v: boolean) => {
                    setRandomVisible(v);
                    if (!v) {
                      setRandomNum(1);
                    }
                  }}
                >
                  <Button
                    disabled={activekey === 2}
                    style={{
                      display: activekey === 2 ? 'none' : '',
                    }}
                  >
                    随机生成用户
                  </Button>
                </Popover>,
                <Button
                  key="add"
                  type="primary"
                  onClick={() => {
                    setVisibleType('create');
                  }}
                >
                  {`新增${activekey === 2 ? '管理员' : '用户'}`}
                </Button>,
              ],
            }}
            pagination={{
              showQuickJumper: true,
            }}
          />
          {renderModal()}
        </>
      )}
    </PageContainer>
  );
};

export default UserList;
