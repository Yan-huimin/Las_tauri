#include "pcl_wrapper.h"
#include <pcl/point_types.h>
#include <pcl/point_cloud.h>

rust::Vec<PointXYZ> generate_point_cloud() {

    pcl::PointCloud<pcl::PointXYZ> cloud;

    for (int i = 0; i < 5; ++i) {
        pcl::PointXYZ p;
        p.x = i; 
        p.y = i; 
        p.z = i;
        cloud.points.push_back(p);
    }

    rust::Vec<PointXYZ> result;

    for (const auto& p : cloud.points) {
        PointXYZ point;   // ✅ 用你自己的类型
        point.x = p.x;
        point.y = p.y;
        point.z = p.z;

        result.push_back(point);
    }

    return result;
}