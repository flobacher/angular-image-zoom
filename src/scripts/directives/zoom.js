angular
    .module('imageZoom')
    .directive('zoom', ['$sce', function ($sce) {

        function link(scope, element, attrs) {

            var $ = angular.element,
                original = $(element[0].querySelector('.original')),
                originalImg = original.find('img'),
                zoomed = $(element[0].querySelector('.zoomed')),
                zoomedImg = zoomed.find('img'),
                mark = $(original[0].querySelector('.mark')),
                origWidth = originalImg[0].naturalWidth,
                origHeight = originalImg[0].naturalHeight,
                lvlCandidate,
                rect;

            if (!origWidth || !origHeight) {
                originalImg[0].addEventListener('load', function(evt) {
                    console.log('loaded', evt.currentTarget);
                    origWidth = originalImg[0].naturalWidth;
                    origHeight = originalImg[0].naturalHeight;

                    scope.markWidth = zoomed[0].clientWidth / origWidth * original[0].clientWidth;
                    scope.markHeight = zoomed[0].clientWidth / origHeight * original[0].clientHeight;

                    mark.css('height', scope.markHeight + 'px')
                        .css('width', scope.markWidth + 'px');

                    moveMarkRel({x:0.5, y:0.5});
                });
            }

            lvlCandidate = parseFloat(scope.level);
            scope.level =  isNaN(lvlCandidate) ? 1 : lvlCandidate;

            //scope.src = $sce.trustAsResourceUrl(scope.imageSrc);
            //console.log('link', scope.imageSrc);


            //element.append(mark);
            //element

            original
                .on('mouseenter', function (evt) {
                    mark.removeClass('hide');
                    //var offset = calculateOffset(evt);
                    //moveMark(offset.x, offset.y);
                    moveMarkRel(calculateOffsetRelative(evt));
                })
                .on('mouseleave', function (evt) {
                    mark.addClass('hide');
                })
                .on('mousemove', function (evt) {
                    //var offset = calculateOffset(evt);
                    //console.log('offsetRel', calculateOffsetRelative(evt));
                    //moveMark(offset.x, offset.y);
                    moveMarkRel(calculateOffsetRelative(evt));
                });

            scope.$on('mark:moved', function (event, data) {
                //updateZoomed.apply(this, data);
                updateZoomedRel.apply(this, data);
            });

            /*
            function moveMark(offsetX, offsetY) {
                var dx = scope.markWidth,
                    dy = scope.markHeight,
                    x = offsetX, // - dx / 2,
                    y = offsetY; // - dy / 2;

                mark
                    .css('left', x + 'px')
                    .css('top', y + 'px');

                scope.$broadcast('mark:moved', [
                    x, y, dx, dy, origHeight, origWidth
                ]);
            }*/

            function moveMarkRel(offsetRel) {

                var dx = scope.markWidth,
                    dy = scope.markHeight,
                    x = offsetRel.x * original[0].clientWidth - dx *.5,
                    y = offsetRel.y * original[0].clientHeight - dy * .5;

                mark
                    .css('left', x + 'px')
                    .css('top',  y + 'px');


                scope.$broadcast('mark:moved', [
                    offsetRel
                ]);

            }

            function updateZoomedRel(offsetRel) {
                console.log('ofdsetRel', offsetRel);
                scope.$apply(function () {
                    zoomedImg
                        .css('left', ((zoomed[0].clientWidth - origWidth)  * (offsetRel.x )) + 'px')
                        .css('top',  ((zoomed[0].clientHeight - origHeight) * (offsetRel.y )) + 'px');
                });
            }

            function updateZoomed(originalX, originalY, originalDx, originalDy, originalHeight, originalWidth) {

                //var zoomLvl = scope.level;

                scope.$apply(function () {
                    //console.log('update zoomedCanvas', zoomLvl, originalX, originalY, originalDx, originalDy, originalHeight, originalWidth);
                    /*zoomedCanvas
                        .css('height', zoomLvl * originalDy + 'px')
                        .css('width', zoomLvl * originalDx + 'px');*/

                    zoomedImg
                        //.attr('src', scope.imageSrc)
                        //.css('height', zoomLvl * originalHeight + 'px')
                        //.css('width', zoomLvl * originalWidth + 'px')
                        .css('left', -zoomLvl * originalX + 'px')
                        .css('top', -zoomLvl * originalY + 'px');
                });
            }



            function calculateOffset(mouseEvent) {
                rect = rect || mouseEvent.currentTarget.getBoundingClientRect();

                return {
                    x: mouseEvent.clientX - rect.left,
                    y: mouseEvent.clientY - rect.top
                }
            }

            function calculateOffsetRelative(mouseEvent) {
                var offsetPix = calculateOffset(mouseEvent);

                return {
                    x: offsetPix.x / mouseEvent.currentTarget.clientWidth,
                    y: offsetPix.y / mouseEvent.currentTarget.clientHeight
                }
            }

            attrs.$observe('ngSrc', function (data) {
                console.log('update src', data, attrs.ngSrc);
                scope.imageSrc = attrs.ngSrc;
            }, true);

            attrs.$observe('level', function (data) {
                console.log('update level', data);
                scope.level = data;
            }, true);
        }

        return {
            restrict: 'EA',
            scope: {
                imageSrc: '@zoomImageSrc',
                level: '@zoomLevel'
            },
            templateUrl: 'zoom.html',
            link: link
        };
    }]);
