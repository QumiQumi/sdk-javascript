var
  should = require('should'),
  rewire = require('rewire'),
  bluebird = require('bluebird'),
  EventEmitter = require('events').EventEmitter,
  Kuzzle = rewire('../../src/kuzzle');

describe('Kuzzle constructor', () => {
  describe('#constructor', function () {
    it('should expose the documented functions', () => {
      var kuzzle;

      Kuzzle.__set__('io', function () { return new EventEmitter; });
      kuzzle = new Kuzzle('nowhere');

      should.exist(kuzzle.addListener);
      should.exist(kuzzle.dataCollectionFactory);
      should.exist(kuzzle.flushQueue);
      should.exist(kuzzle.getAllStatistics);
      should.exist(kuzzle.getStatistics);
      should.exist(kuzzle.listCollections);
      should.exist(kuzzle.logout);
      should.exist(kuzzle.now);
      should.exist(kuzzle.query);
      should.exist(kuzzle.removeAllListeners);
      should.exist(kuzzle.removeListener);
      should.exist(kuzzle.replayQueue);
      should.exist(kuzzle.setHeaders);
      should.exist(kuzzle.startQueuing);
      should.exist(kuzzle.stopQueuing);
    });

    it('should expose the documented properties', () => {
      var kuzzle = new Kuzzle('nowhere');

      should(kuzzle).have.propertyWithDescriptor('autoQueue', { enumerable: true, writable: true, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('autoReconnect', { enumerable: true, writable: false, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('autoReplay', { enumerable: true, writable: true, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('autoResubscribe', { enumerable: true, writable: true, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('offlineQueue', { enumerable: true, writable: true, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('queueFilter', { enumerable: true, writable: true, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('queueMaxSize', { enumerable: true, writable: true, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('queueTTL', { enumerable: true, writable: true, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('headers', { enumerable: true, writable: true, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('metadata', { enumerable: true, writable: true, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('replayInterval', { enumerable: true, writable: true, configurable: false });
      should(kuzzle).have.propertyWithDescriptor('reconnectionDelay', { enumerable: true, writable: false, configurable: false });
    });

    it('should have properties with the documented default values', () => {
      var kuzzle = new Kuzzle('nowhere');

      should(kuzzle.autoQueue).be.false();
      should(kuzzle.autoReconnect).be.true();
      should(kuzzle.autoReplay).be.false();
      should(kuzzle.autoResubscribe).be.true();
      should(kuzzle.queueTTL).be.exactly(120000);
      should(kuzzle.queueMaxSize).be.exactly(500);
      should(kuzzle.headers).be.an.Object().and.be.empty();
      should(kuzzle.metadata).be.an.Object().and.be.empty();
      should(kuzzle.replayInterval).be.exactly(10);
      should(kuzzle.reconnectionDelay).be.exactly(1000);
    });

    it('should initialize correctly properties using the "options" argument', () => {
      var
        options = {
          autoQueue: true,
          autoReconnect: false,
          autoReplay: true,
          autoResubscribe: false,
          queueTTL: 123,
          queueMaxSize: 42,
          headers: {foo: 'bar'},
          metadata: {foo: ['bar', 'baz', 'qux'], bar: 'foo'},
          replayInterval: 99999,
          reconnectionDelay: 666
        },
        kuzzle = new Kuzzle('nowhere', options);

      should(kuzzle.autoQueue).be.exactly(options.autoQueue);
      should(kuzzle.autoReconnect).be.exactly(options.autoReconnect);
      should(kuzzle.autoReplay).be.exactly(options.autoReplay);
      should(kuzzle.autoResubscribe).be.exactly(options.autoResubscribe);
      should(kuzzle.queueTTL).be.exactly(options.queueTTL);
      should(kuzzle.queueMaxSize).be.exactly(options.queueMaxSize);
      should(kuzzle.headers).be.an.Object().and.match(options.headers);
      should(kuzzle.metadata).be.an.Object().and.match(options.metadata);
      should(kuzzle.replayInterval).be.exactly(options.replayInterval);
      should(kuzzle.reconnectionDelay).be.exactly(options.reconnectionDelay);
    });

    it('should handle the offlineMode option properly', () => {
      var kuzzle = new Kuzzle('nowhere', {offlineMode: 'auto'});

      should(kuzzle.autoQueue).be.true();
      should(kuzzle.autoReconnect).be.true();
      should(kuzzle.autoReplay).be.true();
      should(kuzzle.autoResubscribe).be.true();
    });

    it('should handle the connect option properly', () => {
      var kuzzle = new Kuzzle('nowhere', {connect: 'manual'});

      should(kuzzle.state).be.exactly('ready');
      should(kuzzle.socket).be.null();

      kuzzle = new Kuzzle('nowhere', {connect: 'auto'});
      should(kuzzle.state).be.exactly('connecting');
      should(kuzzle.socket).not.be.null();
    });

    it('should return a new instance even if not called with "new"', () => {
      var kuzzle = Kuzzle('nowhere');

      kuzzle.should.be.instanceof(Kuzzle);
    });

    it('should allow passing a callback and respond once initialized', function (done) {
      this.timeout(500);

      Kuzzle.__set__('io', function () {
        var emitter = new EventEmitter;
        process.nextTick(() => emitter.emit('connect'));
        return emitter;
      });

      new Kuzzle('nowhere', () => {
        try {
          kuzzle.isValid();
          done('Error: the kuzzle object should have been invalidated');
        }
        catch(e) {
          done();
        }
      });
    });

    it('should promisify the right functions', () => {
      var kuzzle;

      Kuzzle.prototype.bluebird = bluebird;
      kuzzle = new Kuzzle('nowhere');

      should.not.exist(kuzzle.addListenerPromise);
      should.exist(kuzzle.connectPromise);
      should.not.exist(kuzzle.dataCollectionFactoryPromise);
      should.not.exist(kuzzle.flushQueuePromise);
      should.exist(kuzzle.getAllStatisticsPromise);
      should.exist(kuzzle.getStatisticsPromise);
      should.exist(kuzzle.listCollectionsPromise);
      should.not.exist(kuzzle.logoutPromise);
      should.exist(kuzzle.nowPromise);
      should.exist(kuzzle.queryPromise);
      should.not.exist(kuzzle.removeAllListenersPromise);
      should.not.exist(kuzzle.removeListenerPromise);
      should.not.exist(kuzzle.replayQueuePromise);
      should.not.exist(kuzzle.setHeadersPromise);
      should.not.exist(kuzzle.startQueuingPromise);
      should.not.exist(kuzzle.stopQueuingPromise);
    });

    it('should throw an error if no URL is provided', () => {
      try {
        new Kuzzle();
        should.fail('success', 'failure', 'Constructor should fail with no URL provided', '');
      }
      catch (e) {

      }
    });

    describe('#connect', function () {
      it('should return immediately if not initializing or logged off', function (done) {
        this.timeout(50);

        Kuzzle.__with__({
          io: function () {
            // does nothing, making the test crash if trying to connect
          }
        })(function () {
          var kuzzle = new Kuzzle('nowhere', {connect: 'manual'});

          kuzzle.state = 'connected';
          kuzzle.connect((err, res) => {
            should(err).be.null();
            should(res).be.exactly(kuzzle);
            should(res.state).be.exactly('connected');
            done();
          });

          kuzzle.state = 'reconnecting';
          should(kuzzle.connect()).be.exactly(kuzzle);
          should(kuzzle.state).be.exactly('reconnecting');
        });
      });

      it('should try to connect when the instance is in a not-connected state', function () {
        Kuzzle.__with__({
          io: function () {
            return new EventEmitter;
          }
        })(function () {
          ['initializing', 'ready', 'loggedOff', 'error', 'offline'].forEach(state => {
            var kuzzle = new Kuzzle('nowhere', {connect: 'manual'});

            kuzzle.state = state;
            should(kuzzle.connect()).be.exactly(kuzzle);
            should(kuzzle.state).be.exactly('connecting');
          });
        });
      });

      describe('=> on connection error', () => {
        var
          iostub = function () {
            var emitter = new EventEmitter;
            process.nextTick(() => emitter.emit('connect_error', 'error'));
            return emitter;
          };

        it('should call the provided callback on a connection error', function (done) {
          this.timeout(50);

          Kuzzle.__with__({
            io: iostub
          })(function () {
            var kuzzle = new Kuzzle('nowhere', function (err, res) {
              try {
                should(err).be.exactly('error');
                should(res).be.undefined();
                should(kuzzle.state).be.exactly('error');
                done();
              }
              catch (e) {
                done(e);
              }
            });
          });
        });
      });

      describe('=> on connection success', () => {
        var
          iostub = function () {
            var emitter = new EventEmitter;
            process.nextTick(() => emitter.emit('connect'));
            return emitter;
          };

        it('should call the provided callback on a connection success', function (done) {
          this.timeout(50);

          Kuzzle.__with__({
            io: iostub
          })(function () {
            new Kuzzle('nowhere', function (err, res) {
              try {
                should(err).be.null();
                should(res).be.instanceof(Kuzzle);
                should(res.state).be.exactly('connected');
                done();
              }
              catch (e) {
                done(e);
              }
            });
          });
        });

        it('should renew subscriptions automatically on a connection success', function (done) {
          var renewed = false;

          this.timeout(50);

          Kuzzle.__with__({io: iostub})(function () {
            var kuzzle = new Kuzzle('nowhere', {connect: 'manual', autoResubscribe: false});

            kuzzle.subscriptions['foo'] = {
              bar: {
                renew: function () { renewed = true; }
              }
            };

            kuzzle.connect();
            should(kuzzle.state).be.exactly('connecting');
          });

          setTimeout(() => {
            should(renewed).be.true();
            done();
          }, 20);
        });

        it('should dequeue requests automatically on a connection success', function (done) {
          var
            dequeued = false,
            revert = Kuzzle.__set__('dequeue', function () { dequeued = true; });

          this.timeout(50);


          Kuzzle.__with__({
            io: iostub
          })(function () {
            var kuzzle = new Kuzzle('nowhere', {connect: 'manual', autoReplay: false, autoQueue: false});

            kuzzle.connect(() => {
              should(kuzzle.state).be.exactly('connected');
              should(dequeued).be.true();
              revert();
              done();
            });
          });
        });
      });

      describe('=> on disconnection', () => {
        var
          iostub = function () {
            var emitter = new EventEmitter;

            /*
            since we're stubbing the socket.io socket object,
            we need a stubbed 'close' function to make kuzzle.logout() work
             */
            emitter.close = function () { return false; };
            process.nextTick(() => emitter.emit('disconnect'));
            return emitter;
          };

        before(function () {
          Kuzzle.__set__('io', iostub);
        });


        it('should enter offline mode and call listeners', function (done) {
          var
            kuzzle = new Kuzzle('nowhere'),
            listenerCalled = false;

          this.timeout(200);

          kuzzle.eventListeners.disconnected.push(function () { listenerCalled = true; });

          setTimeout(() => {
            try {
              should(kuzzle.state).be.exactly('offline');
              should(kuzzle.queuing).be.false();
              should(listenerCalled).be.true();
              kuzzle.isValid();
              done();
            }
            catch (e) {
              done(e);
            }
          }, 10);
        });

        it('should enable queuing if autoQueue is set to true', function (done) {
          var kuzzle = new Kuzzle('nowhere', {autoQueue: true});
          this.timeout(200);

          setTimeout(() => {
            try {
              should(kuzzle.state).be.exactly('offline');
              should(kuzzle.queuing).be.true();
              kuzzle.isValid();
              done();
            }
            catch (e) {
              done(e);
            }
          }, 10);
        });

        it('should invalidated the instance if autoReconnect is set to false', function (done) {
          var kuzzle = new Kuzzle('nowhere', {autoReconnect: false});

          this.timeout(200);

          setTimeout(() => {
            try {
              should(kuzzle.state).be.exactly('offline');
              should(kuzzle.queuing).be.false();
              kuzzle.isValid();
              done('the kuzzle instance should have been invalidated');
            }
            catch (e) {
              done();
            }
          }, 10);
        });
      });

      describe('=> on reconnection', () => {
        var
          iostub = function () {
            var emitter = new EventEmitter;
            process.nextTick(() => emitter.emit('reconnect'));
            return emitter;
          };

        before(function () {
          Kuzzle.__set__('io', iostub);
        });

        it('should exit offline mode when reconnecting', function (done) {
          var
            kuzzle = new Kuzzle('nowhere'),
            listenersCalled = false;

          this.timeout(200);

          kuzzle.eventListeners.reconnected.push(function () { listenersCalled = true; });
          kuzzle.queuing = true;

          setTimeout(() => {
            try {
              should(kuzzle.state).be.exactly('connected');
              should(listenersCalled).be.true();
              // should not switch queuing to 'false' automatically by default
              should(kuzzle.queuing).be.true();
              kuzzle.isValid();
              done();
            }
            catch (e) {
              done(e);
            }
          }, 10);
        });

        it('should renew subscriptions automatically when exiting offline mode', function (done) {
          var
            kuzzle = new Kuzzle('nowhere'),
            renewCalled = false,
            stubKuzzleRoom = {
              callback: function () { renewCalled = true; },
              renew: function (cb) { cb(); }
            };

          this.timeout(200);

          kuzzle.subscriptions['foo'] = { bar: stubKuzzleRoom };

          setTimeout(() => {
            try {
              should(kuzzle.state).be.exactly('connected');
              should(renewCalled).be.true();
              kuzzle.isValid();
              done();
            }
            catch (e) {
              done(e);
            }
          }, 10);
        });

        it('should not renew subscriptions if autoResubscribe is set to false', function (done) {
          var
            kuzzle = new Kuzzle('nowhere', {autoResubscribe: false}),
            renewCalled = false,
            stubKuzzleRoom = {
              callback: function () { renewCalled = true; },
              renew: function (cb) { cb(); }
            };

          this.timeout(200);

          kuzzle.subscriptions['foo'] = {
            bar: stubKuzzleRoom
          };

          setTimeout(() => {
            try {
              should(kuzzle.state).be.exactly('connected');
              should(renewCalled).be.false();
              kuzzle.isValid();
              done();
            }
            catch (e) {
              done(e);
            }
          }, 10);
        });

        it('should replay pending requests automatically if autoReplay is set to true', function (done) {
          var
            kuzzle = new Kuzzle('nowhere', {autoReplay: true});

          this.timeout(200);

          kuzzle.queuing = true;

          setTimeout(() => {
            try {
              should(kuzzle.state).be.exactly('connected');
              should(kuzzle.queuing).be.false();
              kuzzle.isValid();
              done();
            }
            catch (e) {
              done(e);
            }
          }, 10);
        });
      });
    });
  });
});