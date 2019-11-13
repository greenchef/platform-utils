
describe('BaseHandler', () => {
	let Base = null;
	let handlerWithoutJob = null;
  beforeAll(() => {
		Base = require('../../handlers/base.handler')
		handlerWithoutJob = new Base('test')
  })
  describe('getTopic', () => {
    test('should return the topic name ', () => {
    	expect(handlerWithoutJob.getTopic()).toEqual('local-test');
    })
  })

  describe('work', () => {
    test('should throw exeption when work is not defined', async () => {
			try{
				await handlerWithoutJob.work()
			} catch (err) {
				expect(err.toString()).toBe('Error: work function not implemented for handler')
			}
    });
	})
	
	describe('getJob', () => {
    test('should return the job I give it', async () => {
			const handlerWithJob = new Base('tets_with_job', function(){ return 'I ran'})
			expect(handlerWithJob.getJob()()).toBe('I ran')
    });
  })
})


