const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const request = require('request-promise');

const { expect } = chai;
chai.use(chaiAsPromised);

const url = 'http://localhost:8081/api/v1';

describe('Validation test', () => {
  it('should validate params and headers', async () => {
    const wrongId = '123456';
    const validId = '12345';
    let endpoint = `${url}/articles/${wrongId}`;
    await expect(request.get(endpoint)).to.eventually.be.rejectedWith('400 - "{\\"success\\":false,\\"message\\":\\"Invalid request\'s params: data.id should NOT be longer than 5 characters\\"}"');
    endpoint = `${url}/articles/${validId}`;
    await expect(request.get(endpoint)).to.eventually.be.rejectedWith('400 - "{\\"success\\":false,\\"message\\":\\"Invalid request\'s headers: data should have required property \'user\'\\"}"');
    await expect(
      request({
        method: 'GET',
        uri: endpoint,
        headers: {
          user: 'user-name',
        },
      }),
    ).to.eventually.be.fulfilled;
  });

  it('should validate body and query', async () => {
    const endpoint = `${url}/articles/12345`;
    await expect(request.put(endpoint))
      .to.eventually.be.rejectedWith('400 - "{\\"success\\":false,\\"message\\":\\"Invalid request\'s headers: data should have required property \'user\'\\"}"');

    await expect(
      request({
        method: 'PUT',
        uri: endpoint,
        headers: {
          user: 'user-name',
        },
      }),
    ).to.eventually.be.rejectedWith('400 - "{\\"success\\":false,\\"message\\":\\"Invalid request\'s query: data should have required property \'name\'\\"}"');

    await expect(
      request({
        method: 'PUT',
        uri: `${endpoint}?name=bag`,
        headers: {
          user: 'user-name',
        },
      }),
    ).to.eventually.be.rejectedWith('400 - "{\\"success\\":false,\\"message\\":\\"Invalid request\'s body: data should have required property \'variationId\'\\"}"');

    const response = await request({
      method: 'PUT',
      uri: `${endpoint}?name=bag`,
      headers: {
        user: 'user-name',
      },
      json: {
        variationId: '12345',
      },
    });

    expect(response).to.deep.equal({
      message: 'Hello from updateArticle',
      data: {
        variationId: '12345',
      },
    });
  });
});
