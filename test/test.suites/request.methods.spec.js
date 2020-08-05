const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const request = require('request-promise');

const { expect } = chai;
chai.use(chaiAsPromised);

const url = 'http://localhost:8081/api/v1';

describe('Request method test', () => {
  it('should have GET method', async () => {
    const response = await request.get(`${url}/articles/12345`, { headers: { user: 'user-name' } });
    expect(response).to.be.equal('Hello from getArticleById');
  });

  it('should have POST method', async () => {
    const requestBody = {
      key: 'value',
    };

    const response = await request({
      method: 'POST',
      uri: `${url}/orders/`,
      json: requestBody,
    });

    expect(response).to.deep.equal({
      message: 'Hello from createOrder',
      data: requestBody,
    });
  });

  it('should have PUT method', async () => {
    const requestBody = {
      variationId: '1234',
    };

    const response = await request({
      method: 'PUT',
      uri: `${url}/articles/12345?name=bag`,
      headers: { user: 'user-name' },
      json: requestBody,
    });

    expect(response).to.deep.equal({
      message: 'Hello from updateArticle',
      data: requestBody,
    });
  });

  it('should have DELETE method', async () => {
    const response = await request.delete(`${url}/orders/`);
    expect(response).to.be.equal('Hello from deleteOrder');
  });
});
