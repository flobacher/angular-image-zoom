/**
 * @license AngularImage Zoom
 * License: MIT
 */
(function(window, document, angular) {
'use strict';
angular.module('imageZoom', []);

angular.module('imageZoom').run(['$templateCache', function($templateCache) {
    $templateCache.put('zoom-control.html','<div class=\"zoom-control__clip\">\r\n    <img ng-src=\"{{imageSrc}}\"/>\r\n    <div class=\"mark\"></div>\r\n</div>\r\n');

    $templateCache.put('zoom-image-container.html','<div class=\"zoom-image-container__clip\">\r\n    <img ng-src=\"{{imageSrc}}\"/>\r\n</div>\r\n');
}]);

angular
    .module('imageZoom')
    .directive('zoomControl', ['$rootScope', function ($rootScope) {

        function link(scope, element, attrs, ctrl) {

            var $ = angular.element,
                clip = $(element[0].querySelector('.zoom-control__clip')),
                image = clip.find('img'),
                mark = $(clip[0].querySelector('.mark')),
                origWidth = image[0].naturalWidth,
                origHeight = image[0].naturalHeight,
                markBoundingRect = mark[0].getBoundingClientRect();



            scope.imageSrc = ctrl.getImageUrl();
            scope.imageContainerElem = ctrl.getImageContainerElem();
            scope.imageContainerElemZoomed = scope.imageContainerElem[0].querySelector('.zoom-image-container__clip');


            scope.$on('zoom-imagesrc:changed', function(evt, newSrc) {
                scope.imageSrc = newSrc;
            });

            if (!origWidth || !origHeight) {
                image[0].addEventListener('load', onImageLoaded);
            }

            function onImageLoaded(evt) {

                origWidth = image[0].naturalWidth;
                origHeight = image[0].naturalHeight;
                //console.log('loaded', evt.currentTarget, origWidth, origHeight);

                ctrl.setOrigDimensions(origWidth, origHeight);

                if(scope.imageContainerElem && scope.imageContainerElem.length > 0) {

                    if(scope.imageContainerElemZoomed) {
                        initMark();
                    } else {
                        scope.$on('zoom-imagecontainer:found', initMark());
                    }

                }
                $rootScope.$broadcast('zoom-image:loaded');


            }

            //scope.level =  isNaN(lvlCandidate) ? 1 : lvlCandidate;
            function initMark() {
                var imageContainerHeight;
                scope.markWidth = scope.imageContainerElemZoomed.clientWidth / origWidth * clip[0].clientWidth;


                imageContainerHeight = scope.imageContainerElemZoomed.clientWidth * (origHeight/origWidth);

                scope.markHeight = imageContainerHeight / origHeight * clip[0].clientHeight;
                //console.log('width x height', scope.imageContainerElemZoomed.clientWidth, origHeight / origWidth);

                mark.css('height', scope.markHeight + 'px')
                    .css('width', scope.markWidth + 'px');

                //console.log('markWidth x markHeight', scope.markWidth, scope.markHeight);
            }

            function onMouseMove(evt) {
                moveMarkRel(calculateOffsetRelative(evt));
            }

            clip.on('mouseenter', function (evt) {
                //console.log('enter');
                moveMarkRel(calculateOffsetRelative(evt));
                clip.on('mousemove', onMouseMove);
            });

            clip.on('mouseleave', function (evt) {
                //console.log('leave');
                clip.off('mousemove', onMouseMove);
            });

            function moveMarkRel(offsetRel) {

                var dx = scope.markWidth,
                    dy = scope.markHeight,
                    x = offsetRel.x * clip[0].clientWidth - dx *.5,
                    y = offsetRel.y * clip[0].clientHeight - dy * .5,
                    verti = clip[0].clientHeight / scope.markHeight,
                    hori =  clip[0].clientWidth / scope.markWidth;

                //console.log('moveMarkRel', offsetRel.y, clip[0].clientHeight, dy *.5);

                mark
                    .css('left', x + 'px')
                    .css('top',  y + 'px');

                $rootScope.$broadcast('mark:moved', [{x:offsetRel.x*(1+hori)-(hori *.5), y:offsetRel.y*(1+verti)-(verti *.5)}]);

            }

            function calculateOffsetRelative(mouseEvent) {

                markBoundingRect = mouseEvent.currentTarget.getBoundingClientRect();
                //console.log('calculateOffsetRelative',  mouseEvent.currentTarget, mouseEvent.clientX, markBoundingRect.left, mouseEvent.currentTarget.clientWidth);
                var relPos = {
                    x: (mouseEvent.clientX - markBoundingRect.left) / mouseEvent.currentTarget.clientWidth,
                    y: (mouseEvent.clientY - markBoundingRect.top) / mouseEvent.currentTarget.clientHeight
                };
                //console.log('calculateOffsetRelative', mouseEvent.clientY, markBoundingRect.top, mouseEvent.currentTarget.clientHeight, relPos);

                return relPos;
            }
        }

        return {
            restrict: 'A',
            require: '^zoom',
            scope: {},
            templateUrl: 'zoom-control.html',
            link: link
        };
    }]);

angular
    .module('imageZoom')
    .directive('zoomImageContainer', function () {

        function link(scope, element, attrs, ctrl) {

            var $ = angular.element,
                zoomed = $(element[0].querySelector('.zoom-image-container__clip')),
                zoomedImg = zoomed.find('img');

            scope.imageSrc = ctrl.getImageUrl();

            scope.$on('zoom-image:loaded', function(event) {
                var imageContainerHeight;

                scope.origDimensions = ctrl.getOrigDimensions();
                imageContainerHeight = zoomed[0].clientWidth * (scope.origDimensions.height/scope.origDimensions.width);
                //console.log('imageContainerHeight', imageContainerHeight);

                zoomed
                    .css('height', imageContainerHeight + 'px');

            });

            scope.$on('mark:moved', function (event, data) {
                updateZoomedRel.apply(this, data);
            });

            scope.$on('zoom-imagesrc:changed', function(evt, newSrc) {
                scope.imageSrc = newSrc;
            });

            function updateZoomedRel(offsetRel) {
                if (!scope.origDimensions) return;
                scope.$apply(function () {
                    zoomedImg
                        .css('left', ((zoomed[0].clientWidth - scope.origDimensions.width)  * (offsetRel.x )) + 'px')
                        .css('top',  ((zoomed[0].clientHeight - scope.origDimensions.height) * (offsetRel.y )) + 'px');
                });
            }

            attrs.$observe('ngSrc', function (data) {
                //console.log('update src', data, attrs.ngSrc);
                scope.imageSrc = attrs.ngSrc;
            }, true);

            attrs.$observe('level', function (data) {
                //console.log('update level', data);
                scope.level = data;
            }, true);
        }

        return {
            restrict: 'A',
            require: '^zoom',
            scope: {},
            templateUrl: 'zoom-image-container.html',
            link: link
        };
    });

angular
    .module('imageZoom')
    .directive('zoom', ['$rootScope', function ($rootScope) {


        function link(scope, element, attrs) {
            var $ = angular.element;
            scope.controlElem = $(element[0].querySelector('[zoom-control]'));
            scope.imageContainerElem = $(element[0].querySelector('[zoom-image-container]'));

            scope.$broadcast('zoom-control:found', scope.controlElem);
            scope.$broadcast('zoom-imagecontainer:found', scope.imageContainerElem);

            //console.log('zoomImageContainerElem', scope.imageContainerElem);

            attrs.$observe('zoomImagesrc', function (data) {
                //console.log('update src', data, attrs.zoom);
                scope.imageSrc = attrs.zoomImagesrc;
                $rootScope.$broadcast('zoom-imagesrc:changed', attrs.zoomImagesrc);
            }, true);

            attrs.$observe('level', function (data) {
                //console.log('update level', data);
                scope.level = data;
            }, true);

        }

        return {
            restrict: 'EA',
            scope: {
                imageSrc: '@zoomImagesrc'
            },
            link: link,
            controller: ['$scope', function($scope) {


                this.getImageUrl = function() {
                    return $scope.imageSrc;
                };

                this.getControlElem = function() {
                    return $scope.controlElem;
                };

                this.getImageContainerElem = function() {
                    return $scope.imageContainerElem;
                };

                this.setOrigDimensions = function(origWidth, origHeight) {
                    $scope.origWidth = origWidth;
                    $scope.origHeight = origHeight;
                };

                this.getOrigDimensions = function() {
                    return {
                        width: $scope.origWidth,
                        height: $scope.origHeight
                    };
                };
            }]
        };
    }]);

})(window, document, window.angular);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsInRlbXBsYXRlcy5qcyIsImRpcmVjdGl2ZXMvem9vbS1jb250cm9sLmpzIiwiZGlyZWN0aXZlcy96b29tLWltYWdlLWNvbnRhaW5lci5qcyIsImRpcmVjdGl2ZXMvem9vbS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJuZ2ltYWdlem9vbS5qcyIsInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXIubW9kdWxlKCdpbWFnZVpvb20nLCBbXSk7XHJcbiIsImFuZ3VsYXIubW9kdWxlKCdpbWFnZVpvb20nKS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICAgJHRlbXBsYXRlQ2FjaGUucHV0KCd6b29tLWNvbnRyb2wuaHRtbCcsJzxkaXYgY2xhc3M9XFxcInpvb20tY29udHJvbF9fY2xpcFxcXCI+XFxyXFxuICAgIDxpbWcgbmctc3JjPVxcXCJ7e2ltYWdlU3JjfX1cXFwiLz5cXHJcXG4gICAgPGRpdiBjbGFzcz1cXFwibWFya1xcXCI+PC9kaXY+XFxyXFxuPC9kaXY+XFxyXFxuJyk7XG5cbiAgICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3pvb20taW1hZ2UtY29udGFpbmVyLmh0bWwnLCc8ZGl2IGNsYXNzPVxcXCJ6b29tLWltYWdlLWNvbnRhaW5lcl9fY2xpcFxcXCI+XFxyXFxuICAgIDxpbWcgbmctc3JjPVxcXCJ7e2ltYWdlU3JjfX1cXFwiLz5cXHJcXG48L2Rpdj5cXHJcXG4nKTtcbn1dKTtcbiIsImFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2ltYWdlWm9vbScpXHJcbiAgICAuZGlyZWN0aXZlKCd6b29tQ29udHJvbCcsIFsnJHJvb3RTY29wZScsIGZ1bmN0aW9uICgkcm9vdFNjb3BlKSB7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGxpbmsoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBjdHJsKSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgJCA9IGFuZ3VsYXIuZWxlbWVudCxcclxuICAgICAgICAgICAgICAgIGNsaXAgPSAkKGVsZW1lbnRbMF0ucXVlcnlTZWxlY3RvcignLnpvb20tY29udHJvbF9fY2xpcCcpKSxcclxuICAgICAgICAgICAgICAgIGltYWdlID0gY2xpcC5maW5kKCdpbWcnKSxcclxuICAgICAgICAgICAgICAgIG1hcmsgPSAkKGNsaXBbMF0ucXVlcnlTZWxlY3RvcignLm1hcmsnKSksXHJcbiAgICAgICAgICAgICAgICBvcmlnV2lkdGggPSBpbWFnZVswXS5uYXR1cmFsV2lkdGgsXHJcbiAgICAgICAgICAgICAgICBvcmlnSGVpZ2h0ID0gaW1hZ2VbMF0ubmF0dXJhbEhlaWdodCxcclxuICAgICAgICAgICAgICAgIG1hcmtCb3VuZGluZ1JlY3QgPSBtYXJrWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG5cclxuXHJcblxyXG4gICAgICAgICAgICBzY29wZS5pbWFnZVNyYyA9IGN0cmwuZ2V0SW1hZ2VVcmwoKTtcclxuICAgICAgICAgICAgc2NvcGUuaW1hZ2VDb250YWluZXJFbGVtID0gY3RybC5nZXRJbWFnZUNvbnRhaW5lckVsZW0oKTtcclxuICAgICAgICAgICAgc2NvcGUuaW1hZ2VDb250YWluZXJFbGVtWm9vbWVkID0gc2NvcGUuaW1hZ2VDb250YWluZXJFbGVtWzBdLnF1ZXJ5U2VsZWN0b3IoJy56b29tLWltYWdlLWNvbnRhaW5lcl9fY2xpcCcpO1xyXG5cclxuXHJcbiAgICAgICAgICAgIHNjb3BlLiRvbignem9vbS1pbWFnZXNyYzpjaGFuZ2VkJywgZnVuY3Rpb24oZXZ0LCBuZXdTcmMpIHtcclxuICAgICAgICAgICAgICAgIHNjb3BlLmltYWdlU3JjID0gbmV3U3JjO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGlmICghb3JpZ1dpZHRoIHx8ICFvcmlnSGVpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICBpbWFnZVswXS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgb25JbWFnZUxvYWRlZCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uSW1hZ2VMb2FkZWQoZXZ0KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgb3JpZ1dpZHRoID0gaW1hZ2VbMF0ubmF0dXJhbFdpZHRoO1xyXG4gICAgICAgICAgICAgICAgb3JpZ0hlaWdodCA9IGltYWdlWzBdLm5hdHVyYWxIZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdsb2FkZWQnLCBldnQuY3VycmVudFRhcmdldCwgb3JpZ1dpZHRoLCBvcmlnSGVpZ2h0KTtcclxuXHJcbiAgICAgICAgICAgICAgICBjdHJsLnNldE9yaWdEaW1lbnNpb25zKG9yaWdXaWR0aCwgb3JpZ0hlaWdodCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYoc2NvcGUuaW1hZ2VDb250YWluZXJFbGVtICYmIHNjb3BlLmltYWdlQ29udGFpbmVyRWxlbS5sZW5ndGggPiAwKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmKHNjb3BlLmltYWdlQ29udGFpbmVyRWxlbVpvb21lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0TWFyaygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLiRvbignem9vbS1pbWFnZWNvbnRhaW5lcjpmb3VuZCcsIGluaXRNYXJrKCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3pvb20taW1hZ2U6bG9hZGVkJyk7XHJcblxyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9zY29wZS5sZXZlbCA9ICBpc05hTihsdmxDYW5kaWRhdGUpID8gMSA6IGx2bENhbmRpZGF0ZTtcclxuICAgICAgICAgICAgZnVuY3Rpb24gaW5pdE1hcmsoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaW1hZ2VDb250YWluZXJIZWlnaHQ7XHJcbiAgICAgICAgICAgICAgICBzY29wZS5tYXJrV2lkdGggPSBzY29wZS5pbWFnZUNvbnRhaW5lckVsZW1ab29tZWQuY2xpZW50V2lkdGggLyBvcmlnV2lkdGggKiBjbGlwWzBdLmNsaWVudFdpZHRoO1xyXG5cclxuXHJcbiAgICAgICAgICAgICAgICBpbWFnZUNvbnRhaW5lckhlaWdodCA9IHNjb3BlLmltYWdlQ29udGFpbmVyRWxlbVpvb21lZC5jbGllbnRXaWR0aCAqIChvcmlnSGVpZ2h0L29yaWdXaWR0aCk7XHJcblxyXG4gICAgICAgICAgICAgICAgc2NvcGUubWFya0hlaWdodCA9IGltYWdlQ29udGFpbmVySGVpZ2h0IC8gb3JpZ0hlaWdodCAqIGNsaXBbMF0uY2xpZW50SGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnd2lkdGggeCBoZWlnaHQnLCBzY29wZS5pbWFnZUNvbnRhaW5lckVsZW1ab29tZWQuY2xpZW50V2lkdGgsIG9yaWdIZWlnaHQgLyBvcmlnV2lkdGgpO1xyXG5cclxuICAgICAgICAgICAgICAgIG1hcmsuY3NzKCdoZWlnaHQnLCBzY29wZS5tYXJrSGVpZ2h0ICsgJ3B4JylcclxuICAgICAgICAgICAgICAgICAgICAuY3NzKCd3aWR0aCcsIHNjb3BlLm1hcmtXaWR0aCArICdweCcpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ21hcmtXaWR0aCB4IG1hcmtIZWlnaHQnLCBzY29wZS5tYXJrV2lkdGgsIHNjb3BlLm1hcmtIZWlnaHQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBvbk1vdXNlTW92ZShldnQpIHtcclxuICAgICAgICAgICAgICAgIG1vdmVNYXJrUmVsKGNhbGN1bGF0ZU9mZnNldFJlbGF0aXZlKGV2dCkpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjbGlwLm9uKCdtb3VzZWVudGVyJywgZnVuY3Rpb24gKGV2dCkge1xyXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnZW50ZXInKTtcclxuICAgICAgICAgICAgICAgIG1vdmVNYXJrUmVsKGNhbGN1bGF0ZU9mZnNldFJlbGF0aXZlKGV2dCkpO1xyXG4gICAgICAgICAgICAgICAgY2xpcC5vbignbW91c2Vtb3ZlJywgb25Nb3VzZU1vdmUpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGNsaXAub24oJ21vdXNlbGVhdmUnLCBmdW5jdGlvbiAoZXZ0KSB7XHJcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdsZWF2ZScpO1xyXG4gICAgICAgICAgICAgICAgY2xpcC5vZmYoJ21vdXNlbW92ZScsIG9uTW91c2VNb3ZlKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBtb3ZlTWFya1JlbChvZmZzZXRSZWwpIHtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgZHggPSBzY29wZS5tYXJrV2lkdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgZHkgPSBzY29wZS5tYXJrSGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgICAgIHggPSBvZmZzZXRSZWwueCAqIGNsaXBbMF0uY2xpZW50V2lkdGggLSBkeCAqLjUsXHJcbiAgICAgICAgICAgICAgICAgICAgeSA9IG9mZnNldFJlbC55ICogY2xpcFswXS5jbGllbnRIZWlnaHQgLSBkeSAqIC41LFxyXG4gICAgICAgICAgICAgICAgICAgIHZlcnRpID0gY2xpcFswXS5jbGllbnRIZWlnaHQgLyBzY29wZS5tYXJrSGVpZ2h0LFxyXG4gICAgICAgICAgICAgICAgICAgIGhvcmkgPSAgY2xpcFswXS5jbGllbnRXaWR0aCAvIHNjb3BlLm1hcmtXaWR0aDtcclxuXHJcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdtb3ZlTWFya1JlbCcsIG9mZnNldFJlbC55LCBjbGlwWzBdLmNsaWVudEhlaWdodCwgZHkgKi41KTtcclxuXHJcbiAgICAgICAgICAgICAgICBtYXJrXHJcbiAgICAgICAgICAgICAgICAgICAgLmNzcygnbGVmdCcsIHggKyAncHgnKVxyXG4gICAgICAgICAgICAgICAgICAgIC5jc3MoJ3RvcCcsICB5ICsgJ3B4Jyk7XHJcblxyXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdtYXJrOm1vdmVkJywgW3t4Om9mZnNldFJlbC54KigxK2hvcmkpLShob3JpICouNSksIHk6b2Zmc2V0UmVsLnkqKDErdmVydGkpLSh2ZXJ0aSAqLjUpfV0pO1xyXG5cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gY2FsY3VsYXRlT2Zmc2V0UmVsYXRpdmUobW91c2VFdmVudCkge1xyXG5cclxuICAgICAgICAgICAgICAgIG1hcmtCb3VuZGluZ1JlY3QgPSBtb3VzZUV2ZW50LmN1cnJlbnRUYXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdjYWxjdWxhdGVPZmZzZXRSZWxhdGl2ZScsICBtb3VzZUV2ZW50LmN1cnJlbnRUYXJnZXQsIG1vdXNlRXZlbnQuY2xpZW50WCwgbWFya0JvdW5kaW5nUmVjdC5sZWZ0LCBtb3VzZUV2ZW50LmN1cnJlbnRUYXJnZXQuY2xpZW50V2lkdGgpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHJlbFBvcyA9IHtcclxuICAgICAgICAgICAgICAgICAgICB4OiAobW91c2VFdmVudC5jbGllbnRYIC0gbWFya0JvdW5kaW5nUmVjdC5sZWZ0KSAvIG1vdXNlRXZlbnQuY3VycmVudFRhcmdldC5jbGllbnRXaWR0aCxcclxuICAgICAgICAgICAgICAgICAgICB5OiAobW91c2VFdmVudC5jbGllbnRZIC0gbWFya0JvdW5kaW5nUmVjdC50b3ApIC8gbW91c2VFdmVudC5jdXJyZW50VGFyZ2V0LmNsaWVudEhlaWdodFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ2NhbGN1bGF0ZU9mZnNldFJlbGF0aXZlJywgbW91c2VFdmVudC5jbGllbnRZLCBtYXJrQm91bmRpbmdSZWN0LnRvcCwgbW91c2VFdmVudC5jdXJyZW50VGFyZ2V0LmNsaWVudEhlaWdodCwgcmVsUG9zKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVsUG9zO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgICAgICAgICByZXF1aXJlOiAnXnpvb20nLFxyXG4gICAgICAgICAgICBzY29wZToge30sXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnem9vbS1jb250cm9sLmh0bWwnLFxyXG4gICAgICAgICAgICBsaW5rOiBsaW5rXHJcbiAgICAgICAgfTtcclxuICAgIH1dKTtcclxuIiwiYW5ndWxhclxyXG4gICAgLm1vZHVsZSgnaW1hZ2Vab29tJylcclxuICAgIC5kaXJlY3RpdmUoJ3pvb21JbWFnZUNvbnRhaW5lcicsIGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gbGluayhzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmwpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciAkID0gYW5ndWxhci5lbGVtZW50LFxyXG4gICAgICAgICAgICAgICAgem9vbWVkID0gJChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy56b29tLWltYWdlLWNvbnRhaW5lcl9fY2xpcCcpKSxcclxuICAgICAgICAgICAgICAgIHpvb21lZEltZyA9IHpvb21lZC5maW5kKCdpbWcnKTtcclxuXHJcbiAgICAgICAgICAgIHNjb3BlLmltYWdlU3JjID0gY3RybC5nZXRJbWFnZVVybCgpO1xyXG5cclxuICAgICAgICAgICAgc2NvcGUuJG9uKCd6b29tLWltYWdlOmxvYWRlZCcsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaW1hZ2VDb250YWluZXJIZWlnaHQ7XHJcblxyXG4gICAgICAgICAgICAgICAgc2NvcGUub3JpZ0RpbWVuc2lvbnMgPSBjdHJsLmdldE9yaWdEaW1lbnNpb25zKCk7XHJcbiAgICAgICAgICAgICAgICBpbWFnZUNvbnRhaW5lckhlaWdodCA9IHpvb21lZFswXS5jbGllbnRXaWR0aCAqIChzY29wZS5vcmlnRGltZW5zaW9ucy5oZWlnaHQvc2NvcGUub3JpZ0RpbWVuc2lvbnMud2lkdGgpO1xyXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnaW1hZ2VDb250YWluZXJIZWlnaHQnLCBpbWFnZUNvbnRhaW5lckhlaWdodCk7XHJcblxyXG4gICAgICAgICAgICAgICAgem9vbWVkXHJcbiAgICAgICAgICAgICAgICAgICAgLmNzcygnaGVpZ2h0JywgaW1hZ2VDb250YWluZXJIZWlnaHQgKyAncHgnKTtcclxuXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgc2NvcGUuJG9uKCdtYXJrOm1vdmVkJywgZnVuY3Rpb24gKGV2ZW50LCBkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB1cGRhdGVab29tZWRSZWwuYXBwbHkodGhpcywgZGF0YSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgc2NvcGUuJG9uKCd6b29tLWltYWdlc3JjOmNoYW5nZWQnLCBmdW5jdGlvbihldnQsIG5ld1NyYykge1xyXG4gICAgICAgICAgICAgICAgc2NvcGUuaW1hZ2VTcmMgPSBuZXdTcmM7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gdXBkYXRlWm9vbWVkUmVsKG9mZnNldFJlbCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFzY29wZS5vcmlnRGltZW5zaW9ucykgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICB6b29tZWRJbWdcclxuICAgICAgICAgICAgICAgICAgICAgICAgLmNzcygnbGVmdCcsICgoem9vbWVkWzBdLmNsaWVudFdpZHRoIC0gc2NvcGUub3JpZ0RpbWVuc2lvbnMud2lkdGgpICAqIChvZmZzZXRSZWwueCApKSArICdweCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jc3MoJ3RvcCcsICAoKHpvb21lZFswXS5jbGllbnRIZWlnaHQgLSBzY29wZS5vcmlnRGltZW5zaW9ucy5oZWlnaHQpICogKG9mZnNldFJlbC55ICkpICsgJ3B4Jyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgYXR0cnMuJG9ic2VydmUoJ25nU3JjJywgZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ3VwZGF0ZSBzcmMnLCBkYXRhLCBhdHRycy5uZ1NyYyk7XHJcbiAgICAgICAgICAgICAgICBzY29wZS5pbWFnZVNyYyA9IGF0dHJzLm5nU3JjO1xyXG4gICAgICAgICAgICB9LCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgIGF0dHJzLiRvYnNlcnZlKCdsZXZlbCcsIGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCd1cGRhdGUgbGV2ZWwnLCBkYXRhKTtcclxuICAgICAgICAgICAgICAgIHNjb3BlLmxldmVsID0gZGF0YTtcclxuICAgICAgICAgICAgfSwgdHJ1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgICAgICAgICByZXF1aXJlOiAnXnpvb20nLFxyXG4gICAgICAgICAgICBzY29wZToge30sXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnem9vbS1pbWFnZS1jb250YWluZXIuaHRtbCcsXHJcbiAgICAgICAgICAgIGxpbms6IGxpbmtcclxuICAgICAgICB9O1xyXG4gICAgfSk7XHJcbiIsImFuZ3VsYXJcclxuICAgIC5tb2R1bGUoJ2ltYWdlWm9vbScpXHJcbiAgICAuZGlyZWN0aXZlKCd6b29tJywgWyckcm9vdFNjb3BlJywgZnVuY3Rpb24gKCRyb290U2NvcGUpIHtcclxuXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGxpbmsoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgICAgICAgIHZhciAkID0gYW5ndWxhci5lbGVtZW50O1xyXG4gICAgICAgICAgICBzY29wZS5jb250cm9sRWxlbSA9ICQoZWxlbWVudFswXS5xdWVyeVNlbGVjdG9yKCdbem9vbS1jb250cm9sXScpKTtcclxuICAgICAgICAgICAgc2NvcGUuaW1hZ2VDb250YWluZXJFbGVtID0gJChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJ1t6b29tLWltYWdlLWNvbnRhaW5lcl0nKSk7XHJcblxyXG4gICAgICAgICAgICBzY29wZS4kYnJvYWRjYXN0KCd6b29tLWNvbnRyb2w6Zm91bmQnLCBzY29wZS5jb250cm9sRWxlbSk7XHJcbiAgICAgICAgICAgIHNjb3BlLiRicm9hZGNhc3QoJ3pvb20taW1hZ2Vjb250YWluZXI6Zm91bmQnLCBzY29wZS5pbWFnZUNvbnRhaW5lckVsZW0pO1xyXG5cclxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnem9vbUltYWdlQ29udGFpbmVyRWxlbScsIHNjb3BlLmltYWdlQ29udGFpbmVyRWxlbSk7XHJcblxyXG4gICAgICAgICAgICBhdHRycy4kb2JzZXJ2ZSgnem9vbUltYWdlc3JjJywgZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ3VwZGF0ZSBzcmMnLCBkYXRhLCBhdHRycy56b29tKTtcclxuICAgICAgICAgICAgICAgIHNjb3BlLmltYWdlU3JjID0gYXR0cnMuem9vbUltYWdlc3JjO1xyXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCd6b29tLWltYWdlc3JjOmNoYW5nZWQnLCBhdHRycy56b29tSW1hZ2VzcmMpO1xyXG4gICAgICAgICAgICB9LCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgIGF0dHJzLiRvYnNlcnZlKCdsZXZlbCcsIGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCd1cGRhdGUgbGV2ZWwnLCBkYXRhKTtcclxuICAgICAgICAgICAgICAgIHNjb3BlLmxldmVsID0gZGF0YTtcclxuICAgICAgICAgICAgfSwgdHJ1ZSk7XHJcblxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVzdHJpY3Q6ICdFQScsXHJcbiAgICAgICAgICAgIHNjb3BlOiB7XHJcbiAgICAgICAgICAgICAgICBpbWFnZVNyYzogJ0B6b29tSW1hZ2VzcmMnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGxpbms6IGxpbmssXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IFsnJHNjb3BlJywgZnVuY3Rpb24oJHNjb3BlKSB7XHJcblxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0SW1hZ2VVcmwgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLmltYWdlU3JjO1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmdldENvbnRyb2xFbGVtID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRzY29wZS5jb250cm9sRWxlbTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRJbWFnZUNvbnRhaW5lckVsZW0gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLmltYWdlQ29udGFpbmVyRWxlbTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRPcmlnRGltZW5zaW9ucyA9IGZ1bmN0aW9uKG9yaWdXaWR0aCwgb3JpZ0hlaWdodCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5vcmlnV2lkdGggPSBvcmlnV2lkdGg7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm9yaWdIZWlnaHQgPSBvcmlnSGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmdldE9yaWdEaW1lbnNpb25zID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6ICRzY29wZS5vcmlnV2lkdGgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogJHNjb3BlLm9yaWdIZWlnaHRcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgfV1cclxuICAgICAgICB9O1xyXG4gICAgfV0pO1xyXG4iXX0=
