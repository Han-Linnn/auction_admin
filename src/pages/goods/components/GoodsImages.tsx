import React, { useRef, useCallback } from 'react';
import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { localGet } from '@/utils/store';
import { uploadURL } from '@/utils/constants';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import './GoodsImages.less';

const { Dragger } = Upload;
const type = 'DragableUploadList';

const GoodsImages: React.FC<{ props: any }> = (props) => {
  const { imagesList, delImagesList } = props;

  const moveRow = useCallback(
    (dragIndex, hoverIndex) => {
      const dragRow = imagesList[dragIndex];
      props.setImagesList(
        update(imagesList, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragRow],
          ],
        }),
      );
    },
    [imagesList],
  );

  const renderImageItem = (originNode: any, file: any, fileList: any) => {
    // eslint-disable-next-line
    const ref = useRef();
    const index = fileList.indexOf(file);
    // eslint-disable-next-line
    const [{ isOver, dropClassName }, drop] = useDrop(
      () => ({
        accept: type,
        collect: (monitor) => {
          const { index: dragIndex } = monitor.getItem() || {};
          if (dragIndex === index) {
            return {};
          }
          return {
            isOver: monitor.isOver(),
            dropClassName: dragIndex < index ? ' drop-over-downward' : ' drop-over-upward',
          };
        },
        drop: (item) => {
          moveRow(item.index, index);
        },
      }),
      [index],
    );
    // eslint-disable-next-line
    const [, drag] = useDrag(
      () => ({
        type,
        item: { index },
        collect: (monitor) => ({
          isDragging: monitor.isDragging(),
        }),
      }),
      [],
    );
    drop(drag(ref));
    return (
      <div
        ref={ref}
        className={`ant-upload-draggable-list-item ${isOver ? dropClassName : ''}`}
        style={{ cursor: 'move' }}
      >
        {originNode}
      </div>
    );
  };

  const uploadProps = {
    name: 'file',
    accept: '.png, .jpg, .jpeg',
    multiple: true,
    listType: 'picture-card',
    maxCount: 2,
    action: uploadURL,
    fileList: imagesList,
    headers: { authorization: `Bearer ${localGet('auctionAdminToken')}` },
    data: { module_name: 'goods' },
    beforeUpload(info: any) {
      if (info) {
        if (imagesList.length < 40) {
          if (info.size / 1024 / 1024 < 16) {
            imagesList.push({
              uid: info.uid,
              url: '',
              smallUrl: '',
            });
            props.setImagesList(imagesList);
            return true;
          }
          message.error('图片大小不能大于16MB!');
          return false;
        }
        return false;
      }
      return false;
    },
    onChange(info: any) {
      if (info.file.status === 'done') {
        const { response, uid } = info.file;
        if (response.code === 200) {
          if ('data' in response) {
            const { data } = response;
            for (let i = 0; i < imagesList.length; i += 1) {
              if (imagesList[i].uid === uid) {
                imagesList[i].url = 'pic_url' in data ? data.pic_url[0] : '';
                imagesList[i].smallUrl = 'pic_small_url' in data ? data.pic_small_url[0] : '';
              }
            }
            props.setImagesList(imagesList);
          }
        }
      }
    },
    onPreview(file: any) {
      window.open(file.url, '_blank');
    },
    onRemove(file: any) {
      const temp = [...imagesList];
      let tempIndex = -1;
      temp.forEach((item: any, index: number) => {
        if (item.uid === file.uid) {
          tempIndex = index;
        }
      });
      if (tempIndex > -1) {
        temp.splice(tempIndex, 1);
        props.setImagesList(temp);
      }

      const tempDel = [...delImagesList];
      tempDel.push(file.url);
      props.setDelImagesList(tempDel);
    },
    itemRender(originNode: any, file: any, currFileList: any) {
      return renderImageItem(originNode, file, currFileList);
    },
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Dragger {...uploadProps}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖动图片到此区域进行上传</p>
        <p className="ant-upload-hint">支持单个或者批量上传, 最多上传40张, 每张不能大于16MB</p>
      </Dragger>
    </DndProvider>
  );
};
export default GoodsImages;
