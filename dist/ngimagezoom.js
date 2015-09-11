(function(window, document, angular) {
'use strict';
angular.module('imageZoom', []);

angular.module('imageZoom').run(['$templateCache', function($templateCache) {
    $templateCache.put('zoom-control.html','<div class=\"zoom-control__clip\">\n    <img ng-src=\"{{imageSrc}}\"/>\n    <div class=\"mark\"></div>\n</div>\n');

    $templateCache.put('zoom-image-container.html','<div class=\"zoom-image-container__clip\">\n    <img ng-src=\"{{imageSrc}}\"/>\n</div>\n');
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
                image[0].addEventListener('load', function(evt) {
                    //console.log('loaded', evt.currentTarget);
                    var imageContainerHeight;

                    origWidth = image[0].naturalWidth;
                    origHeight = image[0].naturalHeight;

                    ctrl.setOrigDimensions(origWidth, origHeight);


                    if(scope.imageContainerElem && scope.imageContainerElem.length > 0) {
                        scope.markWidth = scope.imageContainerElemZoomed.clientWidth / origWidth * clip[0].clientWidth;

                        //console.log('width', scope.imageContainerElemZoomed.clientWidth, origHeight / origWidth);
                        imageContainerHeight = scope.imageContainerElemZoomed.clientWidth * (origHeight/origWidth);

                        scope.markHeight = imageContainerHeight / origHeight * clip[0].clientHeight;

                        $rootScope.$broadcast('zoom-image:loaded', imageContainerHeight);
                    }

                    mark.css('height', scope.markHeight + 'px')
                        .css('width', scope.markWidth + 'px');


                    moveMarkRel({x:0.5, y:0.5});
                });
            }

            //scope.level =  isNaN(lvlCandidate) ? 1 : lvlCandidate;
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
                    verti = clip[0].clientHeight / scope.markHeight, //1.9;
                    hori =  clip[0].clientWidth / scope.markWidth;//2;


                mark
                    .css('left', x + 'px')
                    .css('top',  y + 'px');

                $rootScope.$broadcast('mark:moved', [{x:offsetRel.x*(1+hori)-(hori *.5), y:offsetRel.y*(1+verti)-(verti *.5)}]);

            }

            function calculateOffsetRelative(mouseEvent) {

                markBoundingRect = markBoundingRect || mouseEvent.currentTarget.getBoundingClientRect();

                return {
                    x: (mouseEvent.clientX - markBoundingRect.left) / (mouseEvent.currentTarget.clientWidth),
                    y: (mouseEvent.clientY - markBoundingRect.top) / mouseEvent.currentTarget.clientHeight
                }
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
    .directive('zoomImageContainer', [function () {

        function link(scope, element, attrs, ctrl) {

            var $ = angular.element,
                zoomed = $(element[0].querySelector('.zoom-image-container__clip')),
                zoomedImg = zoomed.find('img');

            scope.imageSrc = ctrl.getImageUrl();

            scope.$on('zoom-image:loaded', function(event, imageContainerHeight) {
                //console.log('imageCOntainerHeight', imageContainerHeight);
                scope.origDimensions = ctrl.getOrigDimensions();
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
                scope.$apply(function () {
                    zoomedImg
                        .css('left', ((zoomed[0].clientWidth - scope.origDimensions.width)  * (offsetRel.x )) + 'px')
                        .css('top',  ((zoomed[0].clientHeight - scope.origDimensions.height) * (offsetRel.y )) + 'px');
                });
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
            restrict: 'A',
            require: '^zoom',
            scope: {},
            templateUrl: 'zoom-image-container.html',
            link: link
        };
    }]);

angular
    .module('imageZoom')
    .directive('zoom', ['$rootScope', function ($rootScope) {


        function link(scope, element, attrs) {
            var $ = angular.element;
            scope.controlElem = $(element[0].querySelector('[zoom-control]'));
            scope.imageContainerElem = $(element[0].querySelector('[zoom-image-container]'));

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
            controller: function($scope) {


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
            }
        };
    }]);

}(window, document, window.angular));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsInRlbXBsYXRlcy5qcyIsImRpcmVjdGl2ZXMvem9vbS1jb250cm9sLmpzIiwiZGlyZWN0aXZlcy96b29tLWltYWdlLWNvbnRhaW5lci5qcyIsImRpcmVjdGl2ZXMvem9vbS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im5naW1hZ2V6b29tLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhci5tb2R1bGUoJ2ltYWdlWm9vbScsIFtdKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdpbWFnZVpvb20nKS5ydW4oWyckdGVtcGxhdGVDYWNoZScsIGZ1bmN0aW9uKCR0ZW1wbGF0ZUNhY2hlKSB7XG4gICAgJHRlbXBsYXRlQ2FjaGUucHV0KCd6b29tLWNvbnRyb2wuaHRtbCcsJzxkaXYgY2xhc3M9XFxcInpvb20tY29udHJvbF9fY2xpcFxcXCI+XFxuICAgIDxpbWcgbmctc3JjPVxcXCJ7e2ltYWdlU3JjfX1cXFwiLz5cXG4gICAgPGRpdiBjbGFzcz1cXFwibWFya1xcXCI+PC9kaXY+XFxuPC9kaXY+XFxuJyk7XG5cbiAgICAkdGVtcGxhdGVDYWNoZS5wdXQoJ3pvb20taW1hZ2UtY29udGFpbmVyLmh0bWwnLCc8ZGl2IGNsYXNzPVxcXCJ6b29tLWltYWdlLWNvbnRhaW5lcl9fY2xpcFxcXCI+XFxuICAgIDxpbWcgbmctc3JjPVxcXCJ7e2ltYWdlU3JjfX1cXFwiLz5cXG48L2Rpdj5cXG4nKTtcbn1dKTtcbiIsImFuZ3VsYXJcbiAgICAubW9kdWxlKCdpbWFnZVpvb20nKVxuICAgIC5kaXJlY3RpdmUoJ3pvb21Db250cm9sJywgWyckcm9vdFNjb3BlJywgZnVuY3Rpb24gKCRyb290U2NvcGUpIHtcblxuICAgICAgICBmdW5jdGlvbiBsaW5rKHNjb3BlLCBlbGVtZW50LCBhdHRycywgY3RybCkge1xuXG4gICAgICAgICAgICB2YXIgJCA9IGFuZ3VsYXIuZWxlbWVudCxcbiAgICAgICAgICAgICAgICBjbGlwID0gJChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy56b29tLWNvbnRyb2xfX2NsaXAnKSksXG4gICAgICAgICAgICAgICAgaW1hZ2UgPSBjbGlwLmZpbmQoJ2ltZycpLFxuICAgICAgICAgICAgICAgIG1hcmsgPSAkKGNsaXBbMF0ucXVlcnlTZWxlY3RvcignLm1hcmsnKSksXG4gICAgICAgICAgICAgICAgb3JpZ1dpZHRoID0gaW1hZ2VbMF0ubmF0dXJhbFdpZHRoLFxuICAgICAgICAgICAgICAgIG9yaWdIZWlnaHQgPSBpbWFnZVswXS5uYXR1cmFsSGVpZ2h0LFxuICAgICAgICAgICAgICAgIG1hcmtCb3VuZGluZ1JlY3QgPSBtYXJrWzBdLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICAgICAgICBzY29wZS5pbWFnZVNyYyA9IGN0cmwuZ2V0SW1hZ2VVcmwoKTtcbiAgICAgICAgICAgIHNjb3BlLmltYWdlQ29udGFpbmVyRWxlbSA9IGN0cmwuZ2V0SW1hZ2VDb250YWluZXJFbGVtKCk7XG4gICAgICAgICAgICBzY29wZS5pbWFnZUNvbnRhaW5lckVsZW1ab29tZWQgPSBzY29wZS5pbWFnZUNvbnRhaW5lckVsZW1bMF0ucXVlcnlTZWxlY3RvcignLnpvb20taW1hZ2UtY29udGFpbmVyX19jbGlwJyk7XG5cbiAgICAgICAgICAgIHNjb3BlLiRvbignem9vbS1pbWFnZXNyYzpjaGFuZ2VkJywgZnVuY3Rpb24oZXZ0LCBuZXdTcmMpIHtcbiAgICAgICAgICAgICAgICBzY29wZS5pbWFnZVNyYyA9IG5ld1NyYztcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoIW9yaWdXaWR0aCB8fCAhb3JpZ0hlaWdodCkge1xuICAgICAgICAgICAgICAgIGltYWdlWzBdLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbihldnQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnbG9hZGVkJywgZXZ0LmN1cnJlbnRUYXJnZXQpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgaW1hZ2VDb250YWluZXJIZWlnaHQ7XG5cbiAgICAgICAgICAgICAgICAgICAgb3JpZ1dpZHRoID0gaW1hZ2VbMF0ubmF0dXJhbFdpZHRoO1xuICAgICAgICAgICAgICAgICAgICBvcmlnSGVpZ2h0ID0gaW1hZ2VbMF0ubmF0dXJhbEhlaWdodDtcblxuICAgICAgICAgICAgICAgICAgICBjdHJsLnNldE9yaWdEaW1lbnNpb25zKG9yaWdXaWR0aCwgb3JpZ0hlaWdodCk7XG5cblxuICAgICAgICAgICAgICAgICAgICBpZihzY29wZS5pbWFnZUNvbnRhaW5lckVsZW0gJiYgc2NvcGUuaW1hZ2VDb250YWluZXJFbGVtLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLm1hcmtXaWR0aCA9IHNjb3BlLmltYWdlQ29udGFpbmVyRWxlbVpvb21lZC5jbGllbnRXaWR0aCAvIG9yaWdXaWR0aCAqIGNsaXBbMF0uY2xpZW50V2lkdGg7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ3dpZHRoJywgc2NvcGUuaW1hZ2VDb250YWluZXJFbGVtWm9vbWVkLmNsaWVudFdpZHRoLCBvcmlnSGVpZ2h0IC8gb3JpZ1dpZHRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlQ29udGFpbmVySGVpZ2h0ID0gc2NvcGUuaW1hZ2VDb250YWluZXJFbGVtWm9vbWVkLmNsaWVudFdpZHRoICogKG9yaWdIZWlnaHQvb3JpZ1dpZHRoKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUubWFya0hlaWdodCA9IGltYWdlQ29udGFpbmVySGVpZ2h0IC8gb3JpZ0hlaWdodCAqIGNsaXBbMF0uY2xpZW50SGVpZ2h0O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3pvb20taW1hZ2U6bG9hZGVkJywgaW1hZ2VDb250YWluZXJIZWlnaHQpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgbWFyay5jc3MoJ2hlaWdodCcsIHNjb3BlLm1hcmtIZWlnaHQgKyAncHgnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNzcygnd2lkdGgnLCBzY29wZS5tYXJrV2lkdGggKyAncHgnKTtcblxuXG4gICAgICAgICAgICAgICAgICAgIG1vdmVNYXJrUmVsKHt4OjAuNSwgeTowLjV9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy9zY29wZS5sZXZlbCA9ICBpc05hTihsdmxDYW5kaWRhdGUpID8gMSA6IGx2bENhbmRpZGF0ZTtcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uTW91c2VNb3ZlKGV2dCkge1xuICAgICAgICAgICAgICAgIG1vdmVNYXJrUmVsKGNhbGN1bGF0ZU9mZnNldFJlbGF0aXZlKGV2dCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjbGlwLm9uKCdtb3VzZWVudGVyJywgZnVuY3Rpb24gKGV2dCkge1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ2VudGVyJyk7XG4gICAgICAgICAgICAgICAgbW92ZU1hcmtSZWwoY2FsY3VsYXRlT2Zmc2V0UmVsYXRpdmUoZXZ0KSk7XG4gICAgICAgICAgICAgICAgY2xpcC5vbignbW91c2Vtb3ZlJywgb25Nb3VzZU1vdmUpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGNsaXAub24oJ21vdXNlbGVhdmUnLCBmdW5jdGlvbiAoZXZ0KSB7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnbGVhdmUnKTtcbiAgICAgICAgICAgICAgICBjbGlwLm9mZignbW91c2Vtb3ZlJywgb25Nb3VzZU1vdmUpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIG1vdmVNYXJrUmVsKG9mZnNldFJlbCkge1xuXG4gICAgICAgICAgICAgICAgdmFyIGR4ID0gc2NvcGUubWFya1dpZHRoLFxuICAgICAgICAgICAgICAgICAgICBkeSA9IHNjb3BlLm1hcmtIZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIHggPSBvZmZzZXRSZWwueCAqIGNsaXBbMF0uY2xpZW50V2lkdGggLSBkeCAqLjUsXG4gICAgICAgICAgICAgICAgICAgIHkgPSBvZmZzZXRSZWwueSAqIGNsaXBbMF0uY2xpZW50SGVpZ2h0IC0gZHkgKiAuNSxcbiAgICAgICAgICAgICAgICAgICAgdmVydGkgPSBjbGlwWzBdLmNsaWVudEhlaWdodCAvIHNjb3BlLm1hcmtIZWlnaHQsIC8vMS45O1xuICAgICAgICAgICAgICAgICAgICBob3JpID0gIGNsaXBbMF0uY2xpZW50V2lkdGggLyBzY29wZS5tYXJrV2lkdGg7Ly8yO1xuXG5cbiAgICAgICAgICAgICAgICBtYXJrXG4gICAgICAgICAgICAgICAgICAgIC5jc3MoJ2xlZnQnLCB4ICsgJ3B4JylcbiAgICAgICAgICAgICAgICAgICAgLmNzcygndG9wJywgIHkgKyAncHgnKTtcblxuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnbWFyazptb3ZlZCcsIFt7eDpvZmZzZXRSZWwueCooMStob3JpKS0oaG9yaSAqLjUpLCB5Om9mZnNldFJlbC55KigxK3ZlcnRpKS0odmVydGkgKi41KX1dKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBjYWxjdWxhdGVPZmZzZXRSZWxhdGl2ZShtb3VzZUV2ZW50KSB7XG5cbiAgICAgICAgICAgICAgICBtYXJrQm91bmRpbmdSZWN0ID0gbWFya0JvdW5kaW5nUmVjdCB8fCBtb3VzZUV2ZW50LmN1cnJlbnRUYXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB4OiAobW91c2VFdmVudC5jbGllbnRYIC0gbWFya0JvdW5kaW5nUmVjdC5sZWZ0KSAvIChtb3VzZUV2ZW50LmN1cnJlbnRUYXJnZXQuY2xpZW50V2lkdGgpLFxuICAgICAgICAgICAgICAgICAgICB5OiAobW91c2VFdmVudC5jbGllbnRZIC0gbWFya0JvdW5kaW5nUmVjdC50b3ApIC8gbW91c2VFdmVudC5jdXJyZW50VGFyZ2V0LmNsaWVudEhlaWdodFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXN0cmljdDogJ0EnLFxuICAgICAgICAgICAgcmVxdWlyZTogJ156b29tJyxcbiAgICAgICAgICAgIHNjb3BlOiB7fSxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnem9vbS1jb250cm9sLmh0bWwnLFxuICAgICAgICAgICAgbGluazogbGlua1xuICAgICAgICB9O1xuICAgIH1dKTtcbiIsImFuZ3VsYXJcbiAgICAubW9kdWxlKCdpbWFnZVpvb20nKVxuICAgIC5kaXJlY3RpdmUoJ3pvb21JbWFnZUNvbnRhaW5lcicsIFtmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgZnVuY3Rpb24gbGluayhzY29wZSwgZWxlbWVudCwgYXR0cnMsIGN0cmwpIHtcblxuICAgICAgICAgICAgdmFyICQgPSBhbmd1bGFyLmVsZW1lbnQsXG4gICAgICAgICAgICAgICAgem9vbWVkID0gJChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJy56b29tLWltYWdlLWNvbnRhaW5lcl9fY2xpcCcpKSxcbiAgICAgICAgICAgICAgICB6b29tZWRJbWcgPSB6b29tZWQuZmluZCgnaW1nJyk7XG5cbiAgICAgICAgICAgIHNjb3BlLmltYWdlU3JjID0gY3RybC5nZXRJbWFnZVVybCgpO1xuXG4gICAgICAgICAgICBzY29wZS4kb24oJ3pvb20taW1hZ2U6bG9hZGVkJywgZnVuY3Rpb24oZXZlbnQsIGltYWdlQ29udGFpbmVySGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnaW1hZ2VDT250YWluZXJIZWlnaHQnLCBpbWFnZUNvbnRhaW5lckhlaWdodCk7XG4gICAgICAgICAgICAgICAgc2NvcGUub3JpZ0RpbWVuc2lvbnMgPSBjdHJsLmdldE9yaWdEaW1lbnNpb25zKCk7XG4gICAgICAgICAgICAgICAgem9vbWVkXG4gICAgICAgICAgICAgICAgICAgIC5jc3MoJ2hlaWdodCcsIGltYWdlQ29udGFpbmVySGVpZ2h0ICsgJ3B4Jyk7XG5cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzY29wZS4kb24oJ21hcms6bW92ZWQnLCBmdW5jdGlvbiAoZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgICAgICAgICB1cGRhdGVab29tZWRSZWwuYXBwbHkodGhpcywgZGF0YSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2NvcGUuJG9uKCd6b29tLWltYWdlc3JjOmNoYW5nZWQnLCBmdW5jdGlvbihldnQsIG5ld1NyYykge1xuICAgICAgICAgICAgICAgIHNjb3BlLmltYWdlU3JjID0gbmV3U3JjO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIHVwZGF0ZVpvb21lZFJlbChvZmZzZXRSZWwpIHtcbiAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB6b29tZWRJbWdcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jc3MoJ2xlZnQnLCAoKHpvb21lZFswXS5jbGllbnRXaWR0aCAtIHNjb3BlLm9yaWdEaW1lbnNpb25zLndpZHRoKSAgKiAob2Zmc2V0UmVsLnggKSkgKyAncHgnKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNzcygndG9wJywgICgoem9vbWVkWzBdLmNsaWVudEhlaWdodCAtIHNjb3BlLm9yaWdEaW1lbnNpb25zLmhlaWdodCkgKiAob2Zmc2V0UmVsLnkgKSkgKyAncHgnKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYXR0cnMuJG9ic2VydmUoJ25nU3JjJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygndXBkYXRlIHNyYycsIGRhdGEsIGF0dHJzLm5nU3JjKTtcbiAgICAgICAgICAgICAgICBzY29wZS5pbWFnZVNyYyA9IGF0dHJzLm5nU3JjO1xuICAgICAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIGF0dHJzLiRvYnNlcnZlKCdsZXZlbCcsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3VwZGF0ZSBsZXZlbCcsIGRhdGEpO1xuICAgICAgICAgICAgICAgIHNjb3BlLmxldmVsID0gZGF0YTtcbiAgICAgICAgICAgIH0sIHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgICAgICByZXF1aXJlOiAnXnpvb20nLFxuICAgICAgICAgICAgc2NvcGU6IHt9LFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd6b29tLWltYWdlLWNvbnRhaW5lci5odG1sJyxcbiAgICAgICAgICAgIGxpbms6IGxpbmtcbiAgICAgICAgfTtcbiAgICB9XSk7XG4iLCJhbmd1bGFyXG4gICAgLm1vZHVsZSgnaW1hZ2Vab29tJylcbiAgICAuZGlyZWN0aXZlKCd6b29tJywgWyckcm9vdFNjb3BlJywgZnVuY3Rpb24gKCRyb290U2NvcGUpIHtcblxuXG4gICAgICAgIGZ1bmN0aW9uIGxpbmsoc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICB2YXIgJCA9IGFuZ3VsYXIuZWxlbWVudDtcbiAgICAgICAgICAgIHNjb3BlLmNvbnRyb2xFbGVtID0gJChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJ1t6b29tLWNvbnRyb2xdJykpO1xuICAgICAgICAgICAgc2NvcGUuaW1hZ2VDb250YWluZXJFbGVtID0gJChlbGVtZW50WzBdLnF1ZXJ5U2VsZWN0b3IoJ1t6b29tLWltYWdlLWNvbnRhaW5lcl0nKSk7XG5cbiAgICAgICAgICAgIGF0dHJzLiRvYnNlcnZlKCd6b29tSW1hZ2VzcmMnLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ3VwZGF0ZSBzcmMnLCBkYXRhLCBhdHRycy56b29tKTtcbiAgICAgICAgICAgICAgICBzY29wZS5pbWFnZVNyYyA9IGF0dHJzLnpvb21JbWFnZXNyYztcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3pvb20taW1hZ2VzcmM6Y2hhbmdlZCcsIGF0dHJzLnpvb21JbWFnZXNyYyk7XG4gICAgICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICAgICAgYXR0cnMuJG9ic2VydmUoJ2xldmVsJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCd1cGRhdGUgbGV2ZWwnLCBkYXRhKTtcbiAgICAgICAgICAgICAgICBzY29wZS5sZXZlbCA9IGRhdGE7XG4gICAgICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnRUEnLFxuICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICBpbWFnZVNyYzogJ0B6b29tSW1hZ2VzcmMnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbGluazogbGluayxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSkge1xuXG5cbiAgICAgICAgICAgICAgICB0aGlzLmdldEltYWdlVXJsID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkc2NvcGUuaW1hZ2VTcmM7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHRoaXMuZ2V0Q29udHJvbEVsZW0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRzY29wZS5jb250cm9sRWxlbTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgdGhpcy5nZXRJbWFnZUNvbnRhaW5lckVsZW0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRzY29wZS5pbWFnZUNvbnRhaW5lckVsZW07XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHRoaXMuc2V0T3JpZ0RpbWVuc2lvbnMgPSBmdW5jdGlvbihvcmlnV2lkdGgsIG9yaWdIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm9yaWdXaWR0aCA9IG9yaWdXaWR0aDtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm9yaWdIZWlnaHQgPSBvcmlnSGVpZ2h0O1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICB0aGlzLmdldE9yaWdEaW1lbnNpb25zID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogJHNjb3BlLm9yaWdXaWR0aCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodDogJHNjb3BlLm9yaWdIZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1dKTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==