"""
Author: yongfa
Date: 2020-12-15 17:02:45
LastEditTime  2021-03-04 11:13:57
LastEditors   yongfa
Description: 远程命令
"""

# fabric
import os
import platform
from fabric import Connection, task
from invoke import run
from dotenv import load_dotenv

# 读取环境变量
env_file_path = os.path.abspath(
    os.path.join(os.path.dirname(__file__), '.flaskenv'))
load_dotenv(env_file_path)


PROJECT_DIR = '/home/yding/data/projects/python/auction/auction_admin'
PROJECT_DIR_PROD = '/root/projects/auction/auction-admin'


local_conn = Connection(
    host=os.getenv('local_host'),
    user=os.getenv('local_user'),
    port=os.getenv('local_port', 22),
    connect_kwargs={'password': os.getenv('local_password')}
)

online_conn = Connection(
    host=os.getenv('online_host'),
    user=os.getenv('online_user'),
    port=os.getenv('online_port', 22),
    connect_kwargs={'password': os.getenv('online_password')}
)


@task
def dev(context):
    """fabric2 不支持文件夹上传，采用压缩打包上传"""
    run('npm run dev_build')  # 本地执行
    source_name = 'dist'
    tar_name = "{}.tar".format(source_name)

    run("tar cvf {} {}".format(tar_name, source_name))  # 压缩文件
    with local_conn.cd(PROJECT_DIR):  # 进入项目根目录
        local_conn.put('nginx.conf', PROJECT_DIR)
        local_conn.put('docker-compose.yml', PROJECT_DIR)
        local_conn.put(tar_name, PROJECT_DIR)  # 远程拷贝
        local_conn.run("tar xvf {}".format(tar_name))  # 解压覆盖
        local_conn.run('rm -rf {}'.format(tar_name))  # 清理多余文件
        local_conn.run('docker-compose restart')

    if platform.system() == 'Windows':
        run('del dist.tar')  # 清理本地多余文件
    else:
        run('rm -f dist.tar')  # 清理本地多余文件


@task
def prod(context):
    """正式环境部署， 采用镜像部署"""
    with online_conn.cd(PROJECT_DIR_PROD):  # 进入项目根目录
        online_conn.put('docker-compose-prod.yml', PROJECT_DIR_PROD + '/docker-compose.yml')
        online_conn.run('docker-compose pull && docker-compose down && docker-compose up -d')
        online_conn.run('docker rmi `docker image ls -f dangling=true -q`')


@task
def prod2(context):
    """本地部署正式环境， 静态文件部署"""
    run('npm run prod_build')  # 本地执行
    source_name = 'dist'
    tar_name = "{}.tar".format(source_name)

    run("tar cvf {} {}".format(tar_name, source_name))  # 压缩文件
    with online_conn.cd(PROJECT_DIR_PROD):  # 进入项目根目录
        online_conn.put('nginx.conf', PROJECT_DIR_PROD)
        online_conn.put('docker-compose.yml', PROJECT_DIR_PROD)
        online_conn.put(tar_name, PROJECT_DIR_PROD)  # 远程拷贝
        online_conn.run("tar xvf {}".format(tar_name))  # 解压覆盖
        online_conn.run('rm -rf {}'.format(tar_name))  # 清理多余文件
        online_conn.run('docker-compose down && docker-compose up -d')

    if platform.system() == 'Windows':
        run('del dist.tar')  # 清理本地多余文件
    else:
        run('rm -f dist.tar')  # 清理本地多余文件


@task
def localBuild(context):
    """本地部署正式环境， 静态文件部署"""

    run('docker build --tag registry.cn-shenzhen.aliyuncs.com/yding/auction_admin:deploy-v0.0.1 .')
    run('docker push registry.cn-shenzhen.aliyuncs.com/yding/auction_admin:deploy-v0.0.1')
