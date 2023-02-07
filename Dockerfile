# FROM registry.cn-shenzhen.aliyuncs.com/yding/node:11.1.0-alpine as builder

# # set working directory
# RUN mkdir -p /usr/src/app
# WORKDIR /usr/src/app

# COPY package.json /usr/src/app/package.json

# RUN npm config set registry=https://registry.npm.taobao.org
# RUN npm install

# COPY . /usr/src/app
# RUN npm run prod_build


# # production environment
FROM registry.cn-shenzhen.aliyuncs.com/yding/nginx:alpine
# COPY --from=builder /usr/src/app/dist /usr/src/app/dist
COPY ./dist /usr/src/app/dist
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]