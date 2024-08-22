FROM nikolaik/python-nodejs:python3.12-nodejs20

#USER pn
#WORKDIR /home/pn/app

RUN mkdir DOCKER_TEST

WORKDIR /home/pn/app/DOCKER_TEST

COPY . ./

RUN npm install

RUN pip install -r requirements.txt

RUN npx -y playwright install --with-deps

#RUN node bin/playwright_test.js

ENTRYPOINT ["node", "bin/www"]

EXPOSE 3000