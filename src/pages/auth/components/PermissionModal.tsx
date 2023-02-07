import React, { useEffect, useState } from 'react';
import { history, useModel } from 'umi';
import { Modal, Checkbox, Row, Col, message } from 'antd';
import { modifyRole, getPermission } from '@/services/api';
import { localRemove } from '@/utils/store';

const PermissionModal: React.FC<{
  props: any
}> = (props) => {
  const { roleData } = props
  const [allPermissions, setAllPermissions] = useState<any[]>([]);
  const [rolePermissions, setRolePermissions] = useState<any[]>([]);
  const { initialState, setInitialState } = useModel('@@initialState');
  const { currentUser } = initialState;

  const getAllPermissions = async () => {
    const response = await getPermission({ page: 1, size: 99 });
    if (response.code === 200) {
      if ('data' in response) {
        if ('items' in response.data) {
          setAllPermissions(response.data.items)
        }
      }
    }
  };

  useEffect(() => {
    getAllPermissions()
  }, [])

  useEffect(() => {
    if (roleData && 'permissions' in roleData) {
      const temp = []
      roleData.permissions.forEach((item: any) => {
        temp.push(item.id)
      })
      setRolePermissions(temp)
    }
  }, [roleData])

  const submitData = async () => {
    const params = {
      name: roleData?.name,
      label: roleData?.label,
      permissions: rolePermissions
    };
    const response = await modifyRole({ id: roleData?.id, data: params })
    if (response.code === 201) {
      message.success('编辑成功');
      props.pModalCancel()

      if (currentUser?.role_id === roleData?.id) {
        setInitialState({ ...initialState, currentUser: {} });
        localRemove('auctionAdminToken')
        history.push('/login');
      }
    }
  }


  const renderItem = () => {
    if (allPermissions.length > 0) {
      return <Checkbox.Group
        value={rolePermissions}
        onChange={(value) => {
          setRolePermissions(value)
        }}
      >
        <Row>
          {allPermissions.map((item: any) => (
            <Col span={24} key={item.id} style={{ paddingLeft: '30px' }}>
              <Checkbox value={item.id}>{item.label}</Checkbox>
            </Col>
          ))}
        </Row>
      </Checkbox.Group>
    }
    return null
  }

  return (
    <Modal
      title='管理角色权限'
      visible={roleData}
      width={350}
      maskClosable={false}
      closable={false}
      onCancel={() => {
        props.pModalCancel()
      }}
      onOk={() => {
        submitData()
      }}
    >
      {renderItem()}
    </Modal>
  )
}

export default PermissionModal
